import { useState, useCallback, useRef } from 'react'
import { View, Text, ScrollView, FlatList, TextInput, Pressable, Modal } from 'react-native'
import { api, errMessage } from './api.js'
import { H1, Field, Input, Button, ErrorNote, Badge, Empty, Card, styles } from './ui.js'
import { fmtPKR, fmtDate, VENDOR_CATEGORIES, categoryLabel, EVENT_TYPES, colors } from './theme.js'

export default function Vendors() {
  const [vendors, setVendors] = useState(null)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [booking, setBooking] = useState(null) // service being booked
  const [form, setForm] = useState({ eventDate: '', eventType: 'wedding', notes: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')
  const debounce = useRef(null)

  const load = useCallback((qq, cat) => {
    const params = new URLSearchParams()
    if (qq) params.set('q', qq)
    if (cat) params.set('category', cat)
    api(`/vendors/search?${params}`).then(({ data }) => {
      setVendors(data)
      setError('')
    }).catch((e) => setError(errMessage(e)))
  }, [])

  useState(() => { load('', '') }, [])

  function onSearch(text) {
    setQ(text)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => load(text, category), 350)
  }
  function onCategory(cat) {
    setCategory(cat)
    load(q, cat)
  }

  async function requestBooking() {
    setBusy(true)
    try {
      await api('/bookings', { method: 'POST', body: { serviceId: booking.id, eventDate: form.eventDate, eventType: form.eventType, notes: form.notes } })
      setBooking(null)
      setDone(`Request sent for "${booking.title}" — the vendor will confirm.`)
      setForm({ eventDate: '', eventType: 'wedding', notes: '' })
    } catch (e) {
      setDone(errMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={vendors || []}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <H1>Find vendors</H1>
            {done ? (
              <Card style={{ backgroundColor: colors.okSoft, borderColor: colors.okSoft }}>
                <Text style={{ color: colors.ok, fontSize: 13 }}>{done}</Text>
              </Card>
            ) : null}
            <ErrorNote message={error} />
            <Input placeholder="Search business or service…" value={q} onChangeText={onSearch} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[['', 'All categories'], ...VENDOR_CATEGORIES.map((c) => [c, categoryLabel(c)])].map(([value, label]) => (
                  <Pressable key={value || 'all'} onPress={() => onCategory(value)} style={{
                    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
                    backgroundColor: category === value ? colors.roseSoft : colors.panel,
                    borderColor: category === value ? colors.roseDeep : colors.stoneDeep,
                  }}>
                    <Text style={{ fontSize: 12, color: category === value ? colors.roseInk : colors.inkSoft }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        }
        renderItem={({ item: v }) => (
          <Pressable onPress={() => setDetail(v)} style={{
            backgroundColor: colors.panel, borderRadius: 14, borderWidth: 1, borderColor: colors.line,
            padding: 16, marginBottom: 12,
          }}>
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 17, color: colors.ink }}>{v.businessName}</Text>
                <Text style={[styles.muted, styles.small]}>{v.city || 'Pakistan'}</Text>
              </View>
              <View style={{ backgroundColor: colors.roseDeep, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>View & book</Text>
              </View>
            </View>
            {v.description ? <Text style={[styles.muted, styles.small, { marginTop: 6 }]} numberOfLines={2}>{v.description}</Text> : null}
            {v.services.slice(0, 2).map((s) => (
              <View key={s.id} style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
                <Text style={{ fontSize: 13, color: colors.inkSoft, flex: 1 }}>{s.title}</Text>
                <Text style={{ fontSize: 13, color: colors.ink, fontVariant: ['tabular-nums'] }}>
                  {s.price ? fmtPKR(s.price) : '—'} <Text style={styles.muted}>{s.priceUnit}</Text>
                </Text>
              </View>
            ))}
          </Pressable>
        )}
        ListEmptyComponent={
          vendors ? <Empty title="No vendors match" hint="Try a different city or clear the category filter." /> : (
            <Card><Text style={[styles.muted, styles.small]}>Loading…</Text></Card>
          )
        }
      />

      {/* Vendor detail sheet */}
      <Modal visible={!!detail} animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={styles.screen}>
          <View style={{ padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.panel }}>
            <Pressable onPress={() => setDetail(null)} hitSlop={8}><Text style={{ color: colors.roseDeep, fontWeight: '600' }}>← Back</Text></Pressable>
            <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 22, color: colors.ink, marginTop: 8 }}>{detail?.businessName}</Text>
            <Text style={[styles.muted, styles.small]}>{detail?.city}{detail?.phone ? ` · ${detail.phone}` : ''}</Text>
            {detail?.description ? <Text style={[styles.small, { color: colors.inkSoft, marginTop: 6 }]}>{detail.description}</Text> : null}
          </View>
          <FlatList
            data={detail?.services || []}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Empty title="No packages yet" hint="This vendor hasn't published packages." />}
            renderItem={({ item: s }) => (
              <Card>
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.ink, flex: 1 }}>{s.title}</Text>
                  <Badge tone="rose">{categoryLabel(s.category)}</Badge>
                </View>
                {s.description ? <Text style={[styles.muted, styles.small, { marginTop: 4 }]}>{s.description}</Text> : null}
                <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
                  <Text style={{ fontWeight: '600', color: colors.roseDeep, fontVariant: ['tabular-nums'] }}>
                    {s.price ? fmtPKR(s.price) : 'On request'} <Text style={[styles.muted, { fontWeight: '400' }]}>{s.priceUnit}</Text>
                  </Text>
                  <Pressable onPress={() => { setBooking(s); setDone('') }} style={{ backgroundColor: colors.roseDeep, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Request booking</Text>
                  </Pressable>
                </View>
              </Card>
            )}
          />
        </View>
      </Modal>

      {/* Booking request sheet */}
      <Modal visible={!!booking} animationType="slide" onRequestClose={() => setBooking(null)}>
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 56 }}>
          <Pressable onPress={() => setBooking(null)} hitSlop={8}><Text style={{ color: colors.roseDeep, fontWeight: '600' }}>← Cancel</Text></Pressable>
          <H1 style={{ marginTop: 12 }}>Request: {booking?.title}</H1>
          <Field label="Event date">
            <Input placeholder="YYYY-MM-DD (e.g. 2027-02-20)" value={form.eventDate} onChangeText={(v) => setForm({ ...form, eventDate: v })} />
          </Field>
          <Field label="Event">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {EVENT_TYPES.map((t) => (
                  <Pressable key={t} onPress={() => setForm({ ...form, eventType: t })} style={{
                    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
                    backgroundColor: form.eventType === t ? colors.roseSoft : colors.panel,
                    borderColor: form.eventType === t ? colors.roseDeep : colors.stoneDeep,
                  }}>
                    <Text style={{ fontSize: 12, color: form.eventType === t ? colors.roseInk : colors.inkSoft }}>{t.replace(/_/g, ' ')}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Field>
          <Field label="Notes for the vendor">
            <Input placeholder="Guest count, timings, what matters most…" multiline value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} style={{ height: 80, textAlignVertical: 'top' }} />
          </Field>
          {booking?.price ? (
            <Text style={[styles.small, { color: colors.muted, marginBottom: 14 }]}>
              {fmtPKR(booking.price)} {booking.priceUnit} — final terms are agreed with the vendor directly.
            </Text>
          ) : null}
          <Button title="Send request" onPress={requestBooking} loading={busy} />
        </ScrollView>
      </Modal>
    </View>
  )
}
