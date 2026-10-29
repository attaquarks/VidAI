import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback } from 'react'
import { View, Text, FlatList, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, errMessage } from './api.js'
import { Badge, Empty, Card, styles } from './ui.js'
import { fmtPKR, fmtDate, categoryLabel, colors } from './theme.js'

const STATUS_TONE = { pending: 'warn', confirmed: 'ok', completed: '', cancelled: 'bad' }

export default function Bookings() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')

  useFocusEffect(useCallback(() => {
    api('/bookings/my-bookings')
      .then(({ data }) => setBookings(data))
      .catch((e) => setError(errMessage(e)))
  }, []))

  async function cancel(b) {
    Alert.alert('Cancel booking?', `Your request to ${b.vendor?.businessName} will be withdrawn.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking', style: 'destructive',
        onPress: async () => {
          try {
            const { data } = await api(`/bookings/${b._id}/status`, { method: 'PATCH', body: { status: 'cancelled' } })
            setBookings((list) => list.map((x) => (x._id === b._id ? data.data : x)))
          } catch (e) {
            Alert.alert('Could not cancel', errMessage(e))
          }
        },
      },
    ])
  }

  return (
    <FlatList
      style={styles.screen}
      data={bookings || []}
      keyExtractor={(b) => b._id}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 26, color: colors.ink }}>My bookings</Text>
          {error ? <Text style={{ color: colors.bad, fontSize: 13, marginTop: 8 }}>{error}</Text> : null}
        </View>
      }
      renderItem={({ item: b }) => (
        <Card>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 16, color: colors.ink }}>{b.vendor?.businessName || 'Vendor'}</Text>
              <Text style={[styles.small, { color: colors.inkSoft, marginTop: 2 }]}>{b.service?.title || '—'}</Text>
              <Text style={[styles.muted, styles.small]}>{categoryLabel(b.service?.category)} · {(b.eventType || '').replace(/_/g, ' ')} · {fmtDate(b.eventDate)}</Text>
              {b.notes ? <Text style={[styles.muted, styles.small, { marginTop: 4, fontStyle: 'italic' }]}>"{b.notes}"</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
              {b.service?.price ? <Text style={{ fontSize: 13, color: colors.ink, fontVariant: ['tabular-nums'] }}>{fmtPKR(b.service.price)}</Text> : null}
              {b.status === 'pending' && (
                <Text onPress={() => cancel(b)} style={{ color: colors.bad, fontSize: 12, fontWeight: '600' }}>Cancel</Text>
              )}
            </View>
          </View>
        </Card>
      )}
      ListEmptyComponent={bookings ? (
        <Empty title="No bookings yet" hint="Browse vendors, open a profile, and send your first request." />
      ) : (
        <Card><Text style={[styles.muted, styles.small]}>Loading…</Text></Card>
      )}
    />
  )
}
