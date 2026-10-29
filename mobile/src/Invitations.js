import { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { api, errMessage } from './api.js'
import { H1, Field, Input, Button, ErrorNote, Card, styles } from './ui.js'
import { colors } from './theme.js'

const TONES = ['Formal & traditional', 'Warm & family', 'Poetic Urdu touch', 'Modern & minimal']

export default function Invitations() {
  const [form, setForm] = useState({ names: '', date: '', time: '', venueName: '', venueCity: '', tone: TONES[0] })
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setForm({ ...form, [k]: v })

  async function generate() {
    setError('')
    setBusy(true)
    try {
      const { data } = await api('/ai/invitations/generate', {
        method: 'POST',
        body: {
          essentials: { names: form.names, date: form.date, time: form.time, venueName: form.venueName, venueCity: form.venueCity },
          style: {},
          tone: form.tone,
        },
      })
      setContent(data.data.generatedContent)
    } catch (e) {
      setError(errMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <H1>Invitation drafts</H1>
      <ErrorNote message={error} />
      <Card>
        <Field label="Names"><Input placeholder="Zoya & Hamza" value={form.names} onChangeText={set('names')} /></Field>
        <Field label="Date"><Input placeholder="14 February 2027" value={form.date} onChangeText={set('date')} /></Field>
        <Field label="Time"><Input placeholder="7:00 in the evening" value={form.time} onChangeText={set('time')} /></Field>
        <Field label="Venue"><Input placeholder="The Family Lawns" value={form.venueName} onChangeText={set('venueName')} /></Field>
        <Field label="City"><Input placeholder="Lahore" value={form.venueCity} onChangeText={set('venueCity')} /></Field>
        <Field label="Tone">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TONES.map((t) => (
              <Pressable key={t} onPress={() => set('tone')(t)} style={{
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
                backgroundColor: form.tone === t ? colors.roseSoft : colors.panel,
                borderColor: form.tone === t ? colors.roseDeep : colors.stoneDeep,
              }}>
                <Text style={{ fontSize: 12, color: form.tone === t ? colors.roseInk : colors.inkSoft }}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Field>
        <Button title="Draft the invitation" onPress={generate} loading={busy} />
      </Card>

      {content && (
        <View style={{
          backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.gold, borderRadius: 14,
          padding: 24, alignItems: 'center', marginTop: 4,
        }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 20, color: colors.roseDeep, textAlign: 'center' }}>{content.headline}</Text>
          <View style={{ width: 70, height: 1, backgroundColor: colors.gold, marginVertical: 14 }} />
          <Text style={{ fontSize: 14, color: colors.ink, textAlign: 'center', lineHeight: 22 }}>{content.bodyText}</Text>
          <Text style={{ fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 12 }}>{content.footerText}</Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4 }}>{content.rsvpInfo}</Text>
        </View>
      )}
    </ScrollView>
  )
}
