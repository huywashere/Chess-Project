package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/huywashere/chess-realtime-go/pkg/game"
	"github.com/huywashere/chess-realtime-go/pkg/matchmaking"
	"github.com/huywashere/chess-realtime-go/pkg/ws"
)

type Server struct {
	hub  *game.Hub
	pool *matchmaking.Pool
}

func parseTimeControl(tc string) (initialSec, incSec int64) {
	switch tc {
	case "1+0":
		return 60, 0
	case "3+0":
		return 180, 0
	case "3+2":
		return 180, 2
	case "5+0":
		return 300, 0
	case "10+0":
		return 600, 0
	case "15+10":
		return 900, 10
	default:
		return 300, 0
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	hub := game.NewHub()

	var pool *matchmaking.Pool
	pool = matchmaking.NewPool(func(result matchmaking.MatchResult) {
		initialSec, incSec := parseTimeControl(result.TimeControl)
		room := hub.GetOrCreateRoom(result.GameID, initialSec, incSec)

		// Assign White & Black
		room.Join(result.WhiteTicket.Client, game.SlotWhite)
		room.Join(result.BlackTicket.Client, game.SlotBlack)

		log.Printf("[Matchmaker] Created room %s for %s (W) vs %s (B)",
			result.GameID, result.WhiteTicket.Username, result.BlackTicket.Username)
	})

	srv := &Server{
		hub:  hub,
		pool: pool,
	}

	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "healthy",
			"service":   "chess-realtime-go",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Hub Stats
	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(srv.hub.GetStats())
	})

	// WebSocket: Join Game Room (/ws/game?roomId=xxx&userId=yyy&username=zzz&slot=white|black|spectator&tc=5+0)
	mux.HandleFunc("/ws/game", srv.handleGameWS)

	// WebSocket: Enter Matchmaking Queue (/ws/matchmake?userId=xxx&username=yyy&elo=1500&tc=3+0)
	mux.HandleFunc("/ws/matchmake", srv.handleMatchmakeWS)

	// Enable CORS for all incoming requests
	handler := enableCORS(mux)

	log.Printf("======================================================")
	log.Printf("🚀 Chess Real-Time Go Gateway started on port :%s", port)
	log.Printf("⚡ High-concurrency WebSocket & Matchmaker active")
	log.Printf("======================================================")

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func (s *Server) handleGameWS(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS Upgrade Error]: %v", err)
		return
	}

	q := r.URL.Query()
	roomID := q.Get("roomId")
	if roomID == "" {
		roomID = "casual_" + randomString(4)
	}
	userID := q.Get("userId")
	if userID == "" {
		userID = "user_" + randomString(6)
	}
	username := q.Get("username")
	if username == "" {
		username = "KỳThủ_" + randomString(3)
	}
	preferredSlot := game.PlayerSlot(strings.ToLower(q.Get("slot")))
	tc := q.Get("tc")
	if tc == "" {
		tc = "5+0"
	}

	initialSec, incSec := parseTimeControl(tc)
	room := s.hub.GetOrCreateRoom(roomID, initialSec, incSec)

	clientID := fmt.Sprintf("%s_%s", userID, randomString(4))

	client := ws.NewClient(clientID, userID, username, conn, func() {
		room.Leave(clientID)
	})

	go client.WritePump()

	// Assign player to room
	room.Join(client, preferredSlot)

	// Listen for incoming moves and actions
	client.ReadPump(func(msg []byte) {
		var event struct {
			Type string          `json:"type"`
			Data json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(msg, &event); err != nil {
			return
		}

		switch event.Type {
		case "move":
			var move game.MovePayload
			if err := json.Unmarshal(event.Data, &move); err == nil {
				room.HandleMove(client, move)
			}
		case "resign":
			room.HandleResign(client)
		}
	})
}

func (s *Server) handleMatchmakeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	q := r.URL.Query()
	userID := q.Get("userId")
	if userID == "" {
		userID = "user_" + randomString(6)
	}
	username := q.Get("username")
	if username == "" {
		username = "KỳThủ_" + randomString(3)
	}
	elo, _ := strconv.Atoi(q.Get("elo"))
	if elo <= 0 {
		elo = 1200
	}
	tc := q.Get("tc")
	if tc == "" {
		tc = "3+0"
	}

	clientID := fmt.Sprintf("mm_%s_%s", userID, randomString(4))
	client := ws.NewClient(clientID, userID, username, conn, func() {
		s.pool.Dequeue(clientID)
	})

	go client.WritePump()

	ticket := &matchmaking.Ticket{
		ID:          clientID,
		UserID:      userID,
		Username:    username,
		Elo:         elo,
		TimeControl: tc,
		Client:      client,
		EnqueuedAt:  time.Now(),
	}

	s.pool.Enqueue(ticket)

	_ = client.SendJSON(game.EventMessage{
		Type: "queued",
		Data: map[string]interface{}{
			"timeControl": tc,
			"elo":         elo,
			"message":     "Đang tìm đối thủ phù hợp trong hàng đợi...",
		},
	})

	client.ReadPump(func(msg []byte) {
		// Can listen for cancel queue events
		var event struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(msg, &event); err == nil && event.Type == "cancel" {
			s.pool.Dequeue(clientID)
			_ = client.SendJSON(game.EventMessage{Type: "queue_cancelled", Data: "Đã hủy tìm trận"})
		}
	})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func randomString(n int) string {
	bytes := make([]byte, n)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
