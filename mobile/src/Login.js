import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from './AuthContext.js'
import { H1, Field, Input, Button, ErrorNote, styles } from './ui.js'
import { colors } from './theme.js'

export default function Login({ navigation }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'android' ? undefined : 'padding'}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.roseDeep, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="heart" size={26} color="#fff" />
          </View>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: colors.roseDeep, marginTop: 10 }}>VidAI</Text>
        </View>
        <H1 style={{ textAlign: 'center' }}>Welcome back</H1>
        <Text style={[styles.muted, styles.small, { textAlign: 'center', marginBottom: 24 }]}>
          Log in to pick up where the planning left off.
        </Text>
        <ErrorNote message={error} />
        <Field label="Email">
          <Input
            keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com"
            value={form.email} onChangeText={(v) => setForm({ ...form, email: v })}
          />
        </Field>
        <Field label="Password">
          <Input secureTextEntry placeholder="Your password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
        </Field>
        <Button title="Log in" onPress={onSubmit} loading={loading} />
        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={[styles.small, { color: colors.roseDeep }]}>
            New to VidAI? Create an account
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
