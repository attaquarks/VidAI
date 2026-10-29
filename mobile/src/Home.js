import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, errMessage } from './api.js'
import { useAuth } from './AuthContext.js'
import { Card, Stat, Badge, Button, Empty, styles } from './ui.js'
import { fmtPKR, fmtDate, colors } from './theme.js'

const STATUS_TONE = { pending: 'warn', confirmed: 'ok', completed: '', cancelled: 'bad' }

export default function Home({ navigation }) {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [b, k] = await Promise.all([api('/budget/me'), api('/bookings/my-bookings')])
      setData({ budget: b.data, bookings: k.data })
      setError('')
    } catch (e) {
      setError(errMessage(e))
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const spent = data?.budget?.items?.reduce((s, i) => s + (i.amount || 0), 0) || 0
  const upcoming = data?.bookings?.filter((b) => b.status !== 'cancelled' && new Date(b.eventDate) >= new Date()) || []

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.body}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} />}
    >
      <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 26, color: colors.ink }}>
        Assalam-o-alaikum
      </Text>
      <Text style={[styles.muted, styles.small, { marginBottom: 18 }]}>Here's your plan{user?.city ? ` — ${user.city}` : ''}</Text>
      {error ? <Card><Text style={{ color: colors.bad, fontSize: 13 }}>{error}</Text></Card> : null}
      {!data && !error && <Card><Text style={styles.muted}>Loading…</Text></Card>}
      {data && (
        <>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Stat num={fmtPKR(data.budget?.totalBudget)} label="Total budget" />
            <Stat num={fmtPKR(spent)} label="Committed" />
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <Stat num={String(data.bookings?.length || 0)} label="Booking requests" />
            <Stat num={String(data.budget?.items?.length || 0)} label="Budget items" />
          </View>

          <Card>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: 8 }}>Upcoming events</Text>
            {upcoming.length ? upcoming.slice(0, 3).map((b) => (
              <View key={b._id} style={[styles.row, { justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: colors.ink }}>{b.service?.title || 'Booking'}</Text>
                  <Text style={[styles.muted, styles.small]}>{b.vendor?.businessName} · {fmtDate(b.eventDate)}</Text>
                </View>
                <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
              </View>
            )) : (
              <Text style={[styles.muted, styles.small]}>Nothing booked yet — find vendors below.</Text>
            )}
          </Card>

          <Button title="Draft an invitation" variant="gold" onPress={() => navigation.navigate('Invitations')} style={{ marginBottom: 10 }} />
          <Button title="Find vendors" variant="outline" onPress={() => navigation.navigate('Vendors')} />
        </>
      )}
    </ScrollView>
  )
}
