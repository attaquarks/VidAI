import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useAuth } from './AuthContext.js'
import { H1, Field, Input, Button, ErrorNote, styles } from './ui.js'
import { CITIES } from './theme.js'

export default function Register({ navigation }) {
  const { register } = useAuth()
  const [role, setRole] = useState('user')
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '', city: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (v) => setForm({ ...form, [k]: v })

  async function onSubmit() {
    setError('')
    setLoading(true)
    try {
      await register({ ...form, email: form.email.trim(), role })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 48 }}>
      <H1>Start planning</H1>
      <Text style={[styles.muted, styles.small, { marginBottom: 20 }]}>
        Free for couples. Vendors join with their business details.
      </Text>
      <ErrorNote message={error} />
      <View style={[styles.row, { gap: 8, marginBottom: 16 }]}>
        {[['user', "I'm planning a wedding"], ['vendor', "I'm a vendor"]].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setRole(value)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center',
              backgroundColor: role === value ? colors.roseSoft : 'transparent',
              borderColor: role === value ? colors.roseDeep : colors.stoneDeep,
            }}
          >
            <Text style={{ color: role === value ? colors.roseInk : colors.inkSoft, fontSize: 13, fontWeight: '600' }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Field label={role === 'vendor' ? 'Your name' : 'Full name'}>
        <Input placeholder="Ayesha Khan" value={form.name} onChangeText={set('name')} />
      </Field>
      {role === 'vendor' && (
        <Field label="Business name">
          <Input placeholder="Gul Photography" value={form.businessName} onChangeText={set('businessName')} />
        </Field>
      )}
      <Field label="Email">
        <Input keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" value={form.email} onChangeText={set('email')} />
      </Field>
      <Field label="City">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          <View style={styles.row, { flexDirection: 'row', gap: 8 }}>
            {['', ...CITIES].map((c) => (
              <Pressable
                key={c || 'none'}
                onPress={() => set('city')(c)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
                  backgroundColor: form.city === c ? colors.roseSoft : colors.panel,
                  borderColor: form.city === c ? colors.roseDeep : colors.stoneDeep,
                }}
              >
                <Text style={{ fontSize: 13, color: form.city === c ? colors.roseInk : colors.inkSoft }}>{c || 'Any'}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Field>
      {role === 'vendor' && (
        <Field label="Phone">
          <Input keyboardType="phone-pad" placeholder="0300-1234567" value={form.phone} onChangeText={set('phone')} />
        </Field>
      )}
      <Field label="Password">
        <Input secureTextEntry placeholder="8+ chars, one uppercase, one number" value={form.password} onChangeText={set('password')} />
      </Field>
      <Button title="Create account" onPress={onSubmit} loading={loading} />
      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18, alignItems: 'center' }}>
        <Text style={[styles.small, { color: colors.roseDeep }]}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  )
}
