import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, errMessage } from './api.js'
import { H1, Field, Input, Button, ErrorNote, Card, Badge, Empty, styles } from './ui.js'
import { fmtPKR, VENDOR_CATEGORIES, categoryLabel, EVENT_TYPES, colors } from './theme.js'

function Bar({ label, pct, amount }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.ink, flex: 1 }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.inkSoft, fontVariant: ['tabular-nums'] }}>{fmtPKR(amount)}</Text>
      </View>
      <View style={{ height: 16, backgroundColor: colors.stone, borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: colors.roseDeep, borderRadius: 5 }} />
      </View>
    </View>
  )
}

export default function Budget() {
  const [budget, setBudget] = useState(null)
  const [error, setError] = useState('')
  const [total, setTotal] = useState('')
  const [eventType, setEventType] = useState('full_wedding')
  const [planning, setPlanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState({ category: 'venue', name: '', amount: '' })

  useFocusEffect(useCallback(() => {
    api('/budget/me').then(({ data }) => {
      setBudget(data)
      setTotal(data.totalBudget ? String(data.totalBudget) : '')
      setEventType(data.eventType || 'full_wedding')
    }).catch((e) => setError(errMessage(e)))
  }, []))

  async function saveBasic() {
    setSaving(true)
    try {
      const { data } = await api('/budget/me', { method: 'PUT', body: { totalBudget: Number(total) || 0, eventType } })
      setBudget(data)
    } catch (e) { setError(errMessage(e)) } finally { setSaving(false) }
  }

  async function generatePlan() {
    if (!(Number(total) > 0)) { setError('Set a total budget first'); return }
    setError('')
    setPlanning(true)
    try {
      await saveBasic()
      const { data } = await api('/budget/ai-plan', { method: 'POST', body: { totalBudget: Number(total), eventType } })
      setBudget(data)
    } catch (e) { setError(errMessage(e)) } finally { setPlanning(false) }
  }

  async function addItem() {
    if (!item.name.trim()) return
    try {
      const { data } = await api('/budget/items', { method: 'POST', body: { ...item, amount: Number(item.amount) || 0 } })
      setBudget(data)
      setItem({ category: item.category, name: '', amount: '' })
    } catch (e) { setError(errMessage(e)) }
  }

  async function removeItem(id) {
    try {
      const { data } = await api(`/budget/items/${id}`, { method: 'DELETE' })
      setBudget(data)
    } catch (e) { Alert.alert('Could not remove', errMessage(e)) }
  }

  const plan = budget?.aiPlan
  const items = budget?.items || []
  const spent = items.reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <H1>Budget planner</H1>
      <ErrorNote message={error} />
      <Card>
        <Field label="Total budget (PKR)">
          <Input keyboardType="number-pad" placeholder="e.g. 2500000" value={total} onChangeText={setTotal} />
        </Field>
        <Field label="Which events?">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {EVENT_TYPES.map((t) => (
                <Pressable key={t} onPress={() => setEventType(t)} style={{
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
                  backgroundColor: eventType === t ? colors.roseSoft : colors.panel,
                  borderColor: eventType === t ? colors.roseDeep : colors.stoneDeep,
                }}>
                  <Text style={{ fontSize: 12, color: eventType === t ? colors.roseInk : colors.inkSoft }}>{t.replace(/_/g, ' ')}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Field>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Save" variant="outline" onPress={saveBasic} loading={saving} style={{ flex: 1 }} />
          <Button title="Generate AI plan" onPress={generatePlan} loading={planning} style={{ flex: 2 }} />
        </View>
      </Card>

      {plan?.allocations?.length ? (
        <Card>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 4 }}>Your allocation</Text>
          {plan.summary ? <Text style={[styles.muted, styles.small, { marginBottom: 10 }]}>{plan.summary}</Text> : null}
          {plan.allocations.map((a, i) => (
            <Bar key={`${a.category}-${i}`} label={categoryLabel(a.category)} pct={a.percentage} amount={a.amount} />
          ))}
          <View style={[styles.row, { justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }]}>
            <Text style={[styles.muted, styles.small]}>Total across {plan.allocations.length} categories</Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 17, color: colors.roseDeep }}>{fmtPKR(plan.totalBudget)}</Text>
          </View>
          {plan.tips?.length ? (
            <View style={{ marginTop: 10 }}>
              {plan.tips.map((t, i) => (
                <Text key={i} style={[styles.small, { color: colors.inkSoft, marginBottom: 4 }]}>• {t}</Text>
              ))}
            </View>
          ) : null}
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.stone }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 16, color: colors.ink, textAlign: 'center' }}>No plan yet</Text>
          <Text style={[styles.muted, styles.small, { textAlign: 'center', marginTop: 4 }]}>
            Set your total and press Generate AI plan — the planner splits it across categories at realistic Pakistani market rates.
          </Text>
        </Card>
      )}

      <Card>
        <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink }}>Your line items</Text>
          <Text style={[styles.small, { color: colors.roseDeep, fontWeight: '600', fontVariant: ['tabular-nums'] }]}>{fmtPKR(spent)}</Text>
        </View>
        {items.length ? items.map((i) => (
          <View key={i._id} style={[styles.row, { justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}><Badge>{categoryLabel(i.category)}</Badge><Text style={{ fontSize: 14, color: colors.ink, marginLeft: 8, flex: 1 }}>{i.name}</Text></View>
            </View>
            <Text style={[styles.small, { color: colors.inkSoft, fontVariant: ['tabular-nums'], marginRight: 10 }]}>{fmtPKR(i.amount)}</Text>
            <Pressable onPress={() => removeItem(i._id)} hitSlop={8}><Ionicons name="close" size={15} color={colors.bad} /></Pressable>
          </View>
        )) : <Text style={[styles.muted, styles.small]}>Add deposits and bookings as you make them.</Text>}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TextInput
            placeholder="Item name" placeholderTextColor="#92867b" value={item.name}
            onChangeText={(v) => setItem({ ...item, name: v })}
            style={{ flex: 1, borderWidth: 1, borderColor: colors.stoneDeep, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: colors.ink }}
          />
          <TextInput
            placeholder="PKR" placeholderTextColor="#92867b" keyboardType="number-pad" value={item.amount}
            onChangeText={(v) => setItem({ ...item, amount: v })}
            style={{ width: 90, borderWidth: 1, borderColor: colors.stoneDeep, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: colors.ink }}
          />
          <Pressable onPress={addItem} style={{ backgroundColor: colors.roseDeep, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' }}>
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {VENDOR_CATEGORIES.slice(0, 10).map((c) => (
              <Pressable key={c} onPress={() => setItem({ ...item, category: c })} style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
                backgroundColor: item.category === c ? colors.roseSoft : colors.panel,
                borderColor: item.category === c ? colors.roseDeep : colors.stoneDeep,
              }}>
                <Text style={{ fontSize: 12, color: item.category === c ? colors.roseInk : colors.inkSoft }}>{categoryLabel(c)}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Card>
    </ScrollView>
  )
}
