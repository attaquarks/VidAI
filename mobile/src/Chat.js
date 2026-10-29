import { Ionicons } from '@expo/vector-icons'
import { useState, useRef } from 'react'
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { api, errMessage } from './api.js'
import { Card, styles } from './ui.js'
import { colors } from './theme.js'

const SUGGESTIONS = [
  'How much does a walima venue cost in Karachi?',
  'Plan a mehndi for 150 guests in Islamabad',
  'What should I book first for a December baraat?',
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  async function send(text) {
    const message = (text ?? input).trim()
    if (!message || busy) return
    setInput('')
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, { role: 'user', content: message }])
    setBusy(true)
    setError('')
    try {
      const { data } = await api('/ai/chat', { method: 'POST', body: { message, conversationHistory: history } })
      setMessages((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: data.data.response }])
    } catch (e) {
      setError(errMessage(e))
    } finally {
      setBusy(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'android' ? undefined : 'padding'}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 16, flexGrow: 1 }}
        ListHeaderComponent={
          messages.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 24, color: colors.ink }}>Assalam-o-alaikum</Text>
              <Text style={[styles.muted, styles.small, { textAlign: 'center', marginTop: 6, marginBottom: 20, paddingHorizontal: 24 }]}>
                Ask me anything about planning your wedding — budgets, vendors, traditions, timelines. I answer in PKR.
              </Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={{
                  borderWidth: 1, borderColor: colors.stoneDeep, borderRadius: 10, backgroundColor: colors.panel,
                  paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, width: '100%',
                }}>
                  <Text style={{ fontSize: 13, color: colors.inkSoft }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: item.role === 'user' ? colors.roseDeep : colors.stone,
            borderRadius: 14,
            borderBottomRightRadius: item.role === 'user' ? 4 : 14,
            borderBottomLeftRadius: item.role === 'user' ? 14 : 4,
            maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8,
          }}>
            <Text style={{ color: item.role === 'user' ? '#fff' : colors.ink, fontSize: 14, lineHeight: 20 }}>{item.content}</Text>
          </View>
        )}
      />
      {busy && (
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.stone, borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 9 }}>
            <Text style={[styles.muted, styles.small]}>VidAI is thinking…</Text>
          </View>
        </View>
      )}
      {error ? <View style={{ paddingHorizontal: 16 }}><Text style={{ color: colors.bad, fontSize: 12 }}>{error}</Text></View> : null}
      <View style={[styles.row, { padding: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.panel }]}>
        <TextInput
          placeholder="Ask about budgets, vendors, traditions…" placeholderTextColor="#92867b"
          value={input} onChangeText={setInput} onSubmitEditing={() => send()} multiline
          style={{ flex: 1, borderWidth: 1, borderColor: colors.stoneDeep, borderRadius: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 14, color: colors.ink, maxHeight: 100 }}
        />
        <Pressable onPress={() => send()} disabled={busy || !input.trim()} style={{
          backgroundColor: colors.roseDeep, borderRadius: 10, width: 46, alignItems: 'center', justifyContent: 'center', marginLeft: 8, opacity: busy || !input.trim() ? 0.5 : 1,
        }}>
          <Ionicons name="send" size={17} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
