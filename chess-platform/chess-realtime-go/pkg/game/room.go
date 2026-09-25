package game

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/huywashere/chess-realtime-go/pkg/ws"
)

type PlayerSlot string

const (
	SlotWhite     PlayerSlot = "white"
	SlotBlack     PlayerSlot = "black"
	SlotSpectator PlayerSlot = "spectator"
)

type EventMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type MovePayload struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Promotion string `json:"promotion,omitempty"`
	San       string `json:"san,omitempty"`
	Fen       string `json:"fen"`
}

type ClockSyncPayload struct {
	WhiteTimeMs int64  `json:"whiteTimeMs"`
	BlackTimeMs int64  `json:"blackTimeMs"`
	Turn        string `json:"turn"`
}

type GameRoom struct {
	ID           string
	mu           sync.RWMutex
	WhitePlayer  *ws.Client
	BlackPlayer  *ws.Client
	Spectators   map[string]*ws.Client
	WhiteTimeMs  int64
	BlackTimeMs  int64
	IncrementMs  int64
	CurrentTurn  string // "w" or "b"
	FEN          string
	Moves        []string
	Status       string // "waiting", "active", "finished"
	Winner       string
	LastMoveTime time.Time
	stopClock    chan struct{}
	isClockLive  bool
}

func NewGameRoom(id string, initialSeconds, incrementSeconds int64) *GameRoom {
	return &GameRoom{
		ID:          id,
		Spectators:  make(map[string]*ws.Client),
		WhiteTimeMs: initialSeconds * 1000,
		BlackTimeMs: initialSeconds * 1000,
		IncrementMs: incrementSeconds * 1000,
		CurrentTurn: "w",
		FEN:         "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
		Moves:       make([]string, 0),
		Status:      "waiting",
		stopClock:   make(chan struct{}),
	}
}

// JoinRoom adds a client to the game as White, Black, or Spectator
func (r *GameRoom) Join(c *ws.Client, preferredSlot PlayerSlot) PlayerSlot {
	r.mu.Lock()
	defer r.mu.Unlock()

	var assignedSlot PlayerSlot

	if preferredSlot == SlotWhite && r.WhitePlayer == nil {
		r.WhitePlayer = c
		assignedSlot = SlotWhite
	} else if preferredSlot == SlotBlack && r.BlackPlayer == nil {
		r.BlackPlayer = c
		assignedSlot = SlotBlack
	} else if r.WhitePlayer == nil {
		r.WhitePlayer = c
		assignedSlot = SlotWhite
	} else if r.BlackPlayer == nil {
		r.BlackPlayer = c
		assignedSlot = SlotBlack
	} else {
		r.Spectators[c.ID] = c
		assignedSlot = SlotSpectator
	}

	// If both players are seated, start game clock
	if r.WhitePlayer != nil && r.BlackPlayer != nil && r.Status == "waiting" {
		r.Status = "active"
		r.LastMoveTime = time.Now()
		r.startClockRoutine()
	}

	// Send current game state to the joining client
	_ = c.SendJSON(EventMessage{
		Type: "game_joined",
		Data: map[string]interface{}{
			"gameId":      r.ID,
			"slot":        assignedSlot,
			"status":      r.Status,
			"fen":         r.FEN,
			"whiteTimeMs": r.WhiteTimeMs,
			"blackTimeMs": r.BlackTimeMs,
			"turn":        r.CurrentTurn,
		},
	})

	r.broadcastLocked("player_joined", map[string]interface{}{
		"gameId":   r.ID,
		"username": c.Username,
		"slot":     assignedSlot,
	})

	log.Printf("[Room %s] Client %s joined as %s", r.ID, c.Username, assignedSlot)
	return assignedSlot
}

// Leave handles client disconnection
func (r *GameRoom) Leave(clientID string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	var leftSlot string
	if r.WhitePlayer != nil && r.WhitePlayer.ID == clientID {
		r.WhitePlayer = nil
		leftSlot = "white"
	} else if r.BlackPlayer != nil && r.BlackPlayer.ID == clientID {
		r.BlackPlayer = nil
		leftSlot = "black"
	} else {
		delete(r.Spectators, clientID)
		leftSlot = "spectator"
	}

	r.broadcastLocked("player_left", map[string]interface{}{
		"gameId":   r.ID,
		"slot":     leftSlot,
		"clientId": clientID,
	})
}

// Handle incoming move from a player
func (r *GameRoom) HandleMove(c *ws.Client, payload MovePayload) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.Status != "active" {
		_ = c.SendJSON(EventMessage{Type: "error", Data: "Ván cờ chưa bắt đầu hoặc đã kết thúc"})
		return
	}

	// Validate turn matches player slot
	isWhiteTurn := r.CurrentTurn == "w"
	if isWhiteTurn && (r.WhitePlayer == nil || r.WhitePlayer.ID != c.ID) {
		_ = c.SendJSON(EventMessage{Type: "error", Data: "Chưa tới lượt của bạn"})
		return
	}
	if !isWhiteTurn && (r.BlackPlayer == nil || r.BlackPlayer.ID != c.ID) {
		_ = c.SendJSON(EventMessage{Type: "error", Data: "Chưa tới lượt của bạn"})
		return
	}

	// Calculate and apply clock elapsed time with increment
	now := time.Now()
	elapsedMs := now.Sub(r.LastMoveTime).Milliseconds()
	r.LastMoveTime = now

	if isWhiteTurn {
		r.WhiteTimeMs = max(0, r.WhiteTimeMs-elapsedMs) + r.IncrementMs
		r.CurrentTurn = "b"
	} else {
		r.BlackTimeMs = max(0, r.BlackTimeMs-elapsedMs) + r.IncrementMs
		r.CurrentTurn = "w"
	}

	r.FEN = payload.Fen
	if payload.San != "" {
		r.Moves = append(r.Moves, payload.San)
	}

	// Broadcast move to white, black, and all spectators
	r.broadcastLocked("move_made", map[string]interface{}{
		"from":        payload.From,
		"to":          payload.To,
		"promotion":   payload.Promotion,
		"san":         payload.San,
		"fen":         payload.Fen,
		"whiteTimeMs": r.WhiteTimeMs,
		"blackTimeMs": r.BlackTimeMs,
		"turn":        r.CurrentTurn,
	})
}

// Resign handles resignation
func (r *GameRoom) HandleResign(c *ws.Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.Status != "active" {
		return
	}

	r.Status = "finished"
	if r.WhitePlayer != nil && r.WhitePlayer.ID == c.ID {
		r.Winner = "black"
	} else if r.BlackPlayer != nil && r.BlackPlayer.ID == c.ID {
		r.Winner = "white"
	}

	r.stopClockRoutine()

	r.broadcastLocked("game_over", map[string]interface{}{
		"reason": "resignation",
		"winner": r.Winner,
	})
}

func (r *GameRoom) startClockRoutine() {
	if r.isClockLive {
		return
	}
	r.isClockLive = true

	go func() {
		ticker := time.NewTicker(100 * time.Millisecond)
		syncTicker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		defer syncTicker.Stop()

		for {
			select {
			case <-r.stopClock:
				return
			case <-ticker.C:
				r.mu.Lock()
				if r.Status != "active" {
					r.mu.Unlock()
					return
				}

				now := time.Now()
				elapsed := now.Sub(r.LastMoveTime).Milliseconds()

				var isTimeout bool
				if r.CurrentTurn == "w" {
					if r.WhiteTimeMs-elapsed <= 0 {
						r.WhiteTimeMs = 0
						isTimeout = true
						r.Winner = "black"
					}
				} else {
					if r.BlackTimeMs-elapsed <= 0 {
						r.BlackTimeMs = 0
						isTimeout = true
						r.Winner = "white"
					}
				}

				if isTimeout {
					r.Status = "finished"
					r.broadcastLocked("game_over", map[string]interface{}{
						"reason": "timeout",
						"winner": r.Winner,
					})
					r.mu.Unlock()
					return
				}
				r.mu.Unlock()

			case <-syncTicker.C:
				// Broadcast clock sync every 1s to prevent client clock drifting
				r.mu.RLock()
				if r.Status == "active" {
					r.broadcastLocked("clock_sync", ClockSyncPayload{
						WhiteTimeMs: r.WhiteTimeMs,
						BlackTimeMs: r.BlackTimeMs,
						Turn:        r.CurrentTurn,
					})
				}
				r.mu.RUnlock()
			}
		}
	}()
}

func (r *GameRoom) stopClockRoutine() {
	if r.isClockLive {
		r.isClockLive = false
		close(r.stopClock)
	}
}

func (r *GameRoom) broadcastLocked(eventType string, data interface{}) {
	msg := EventMessage{Type: eventType, Data: data}
	bytes, err := json.Marshal(msg)
	if err != nil {
		return
	}

	if r.WhitePlayer != nil {
		r.WhitePlayer.Send <- bytes
	}
	if r.BlackPlayer != nil {
		r.BlackPlayer.Send <- bytes
	}
	for _, spec := range r.Spectators {
		select {
		case spec.Send <- bytes:
		default:
		}
	}
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
