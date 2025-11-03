import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your RightFit Services AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      // Get property_id from sessionStorage (set by GuestWelcome)
      const propertyId = sessionStorage.getItem('guest_property_id') || 'demo-property'

      const response = await fetch('/api/guest/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          question: inputValue.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.answer || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact the property manager.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          color: 'white',
        }}
      >
        <IconButton
          onClick={() => navigate('/')}
          sx={{ color: 'white', mr: 2 }}
          size="large"
        >
          <BackIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Ask a Question
        </Typography>
      </Box>

      {/* Chat Container */}
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: 1000,
          width: '100%',
          mx: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
                  <BotIcon />
                </Avatar>
              )}

              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? '#667eea' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: 'block',
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Paper>

              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: '#764ba2', width: 48, height: 48 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}

          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
                <BotIcon />
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CircularProgress size={20} />
                <Typography variant="body1">Thinking...</Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your question here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '1.1rem',
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              sx={{
                minWidth: 80,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408d 100%)',
                },
              }}
            >
              <SendIcon fontSize="large" />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
