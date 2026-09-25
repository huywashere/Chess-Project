package game

import (
	"sync"
)

type Hub struct {
	rooms sync.Map // map[string]*GameRoom
}

func NewHub() *Hub {
	return &Hub{}
}

func (h *Hub) GetOrCreateRoom(roomID string, initialSeconds, incrementSeconds int64) *GameRoom {
	val, ok := h.rooms.Load(roomID)
	if ok {
		return val.(*GameRoom)
	}

	room := NewGameRoom(roomID, initialSeconds, incrementSeconds)
	actual, _ := h.rooms.LoadOrStore(roomID, room)
	return actual.(*GameRoom)
}

func (h *Hub) GetRoom(roomID string) (*GameRoom, bool) {
	val, ok := h.rooms.Load(roomID)
	if !ok {
		return nil, false
	}
	return val.(*GameRoom), true
}

func (h *Hub) RemoveRoom(roomID string) {
	val, ok := h.rooms.LoadAndDelete(roomID)
	if ok {
		val.(*GameRoom).stopClockRoutine()
	}
}

func (h *Hub) GetStats() map[string]interface{} {
	totalRooms := 0
	activeRooms := 0
	totalPlayers := 0
	totalSpectators := 0

	h.rooms.Range(func(key, value interface{}) bool {
		r := value.(*GameRoom)
		r.mu.RLock()
		defer r.mu.RUnlock()

		totalRooms++
		if r.Status == "active" {
			activeRooms++
		}
		if r.WhitePlayer != nil {
			totalPlayers++
		}
		if r.BlackPlayer != nil {
			totalPlayers++
		}
		totalSpectators += len(r.Spectators)
		return true
	})

	return map[string]interface{}{
		"totalRooms":      totalRooms,
		"activeRooms":     activeRooms,
		"totalPlayers":    totalPlayers,
		"totalSpectators": totalSpectators,
	}
}
