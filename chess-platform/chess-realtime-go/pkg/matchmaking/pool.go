package matchmaking

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	"github.com/huywashere/chess-realtime-go/pkg/ws"
)

type Ticket struct {
	ID          string
	UserID      string
	Username    string
	Elo         int
	TimeControl string
	Client      *ws.Client
	EnqueuedAt  time.Time
}

type MatchResult struct {
	GameID      string
	WhiteTicket *Ticket
	BlackTicket *Ticket
	TimeControl string
}

type Pool struct {
	mu      sync.Mutex
	tickets map[string][]*Ticket // map[timeControl][]*Ticket
	onMatch func(result MatchResult)
}

func NewPool(onMatch func(result MatchResult)) *Pool {
	p := &Pool{
		tickets: make(map[string][]*Ticket),
		onMatch: onMatch,
	}
	go p.runMatchmaker()
	return p
}

func (p *Pool) Enqueue(t *Ticket) {
	p.mu.Lock()
	defer p.mu.Unlock()

	p.tickets[t.TimeControl] = append(p.tickets[t.TimeControl], t)
	log.Printf("[Matchmaking] User %s (%d ELO) queued for %s", t.Username, t.Elo, t.TimeControl)
}

func (p *Pool) Dequeue(clientID string) {
	p.mu.Lock()
	defer p.mu.Unlock()

	for tc, list := range p.tickets {
		newList := make([]*Ticket, 0, len(list))
		for _, t := range list {
			if t.Client.ID != clientID {
				newList = append(newList, t)
			}
		}
		p.tickets[tc] = newList
	}
}

func (p *Pool) runMatchmaker() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		p.matchTickets()
	}
}

func (p *Pool) matchTickets() {
	p.mu.Lock()
	defer p.mu.Unlock()

	now := time.Now()

	for tc, list := range p.tickets {
		if len(list) < 2 {
			continue
		}

		matchedIndices := make(map[int]bool)

		for i := 0; i < len(list); i++ {
			if matchedIndices[i] {
				continue
			}

			t1 := list[i]
			waitSec := int(now.Sub(t1.EnqueuedAt).Seconds())
			// Base threshold 50 ELO, expands by 30 ELO every 2 seconds waiting, max 500 ELO diff
			maxEloDiff := int(math.Min(500, float64(50+(waitSec/2)*30)))

			bestMatchIdx := -1
			minDiff := 999999

			for j := i + 1; j < len(list); j++ {
				if matchedIndices[j] {
					continue
				}

				t2 := list[j]
				if t1.UserID == t2.UserID {
					continue // Don't pair same user against themselves
				}

				diff := int(math.Abs(float64(t1.Elo - t2.Elo)))
				if diff <= maxEloDiff && diff < minDiff {
					minDiff = diff
					bestMatchIdx = j
				}
			}

			if bestMatchIdx != -1 {
				t2 := list[bestMatchIdx]
				matchedIndices[i] = true
				matchedIndices[bestMatchIdx] = true

				gameID := generateGameID()

				// Randomize who gets white
				white, black := t1, t2
				if now.UnixNano()%2 == 0 {
					white, black = t2, t1
				}

				result := MatchResult{
					GameID:      gameID,
					WhiteTicket: white,
					BlackTicket: black,
					TimeControl: tc,
				}

				if p.onMatch != nil {
					go p.onMatch(result)
				}
			}
		}

		// Rebuild queue without matched tickets
		remaining := make([]*Ticket, 0, len(list))
		for i, t := range list {
			if !matchedIndices[i] {
				remaining = append(remaining, t)
			}
		}
		p.tickets[tc] = remaining
	}
}

func generateGameID() string {
	bytes := make([]byte, 6)
	_, _ = rand.Read(bytes)
	return fmt.Sprintf("game_%s", hex.EncodeToString(bytes))
}
