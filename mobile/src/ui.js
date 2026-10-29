import { Text, TextInput, View, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { colors } from './theme.js'

export const H1 = ({ children, style }) => (
  <Text style={[{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 28, color: colors.ink, marginBottom: 8 }, style]}>
    {children}
  </Text>
)

export const Field = ({ label, children }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginBottom: 6 }}>{label}</Text>
    {children}
  </View>
)

export const Input = (props) => (
  <TextInput
    placeholderTextColor="#92867b"
    {...props}
    style={[{
      borderWidth: 1, borderColor: colors.stoneDeep, borderRadius: 10, backgroundColor: colors.panel,
      paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.ink,
    }, props.style]}
  />
)

export const Button = ({ title, onPress, loading, variant = 'primary', style, disabled }) => {
  const bg = { primary: colors.roseDeep, outline: 'transparent', gold: 'transparent' }[variant]
  const fg = { primary: '#fff', outline: colors.ink, gold: colors.goldDeep }[variant]
  const bc = { primary: 'transparent', outline: colors.stoneDeep, gold: colors.gold }[variant]
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [{
        backgroundColor: bg, borderColor: bc, borderWidth: 1, borderRadius: 10,
        paddingVertical: 13, alignItems: 'center', opacity: pressed || disabled || loading ? 0.6 : 1,
      }, style]}
    >
      {loading
        ? <ActivityIndicator color={fg} />
        : <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{title}</Text>}
    </Pressable>
  )
}

export const ErrorNote = ({ message }) =>
  message ? (
    <View style={{ backgroundColor: colors.badSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
      <Text style={{ color: colors.bad, fontSize: 13 }}>{message}</Text>
    </View>
  ) : null

export const Badge = ({ tone = '', children }) => {
  const map = {
    '': { bg: colors.stone, fg: colors.inkSoft },
    rose: { bg: colors.roseSoft, fg: colors.roseInk },
    ok: { bg: colors.okSoft, fg: colors.ok },
    warn: { bg: colors.warnSoft, fg: colors.warn },
    bad: { bg: colors.badSoft, fg: colors.bad },
    gold: { bg: '#fdf3dc', fg: colors.goldDeep },
  }
  const s = map[tone] || map['']
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: s.fg, fontSize: 12, fontWeight: '500' }}>{children}</Text>
    </View>
  )
}

export const Card = ({ children, style }) => (
  <View style={[{
    backgroundColor: colors.panel, borderRadius: 14, borderWidth: 1, borderColor: colors.line,
    padding: 16, marginBottom: 12,
  }, style]}>
    {children}
  </View>
)

export const Stat = ({ num, label }) => (
  <Card style={{ flex: 1, marginHorizontal: 4, marginBottom: 0 }}>
    <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 22, color: colors.roseDeep }}>{num}</Text>
    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{label}</Text>
  </Card>
)

export const Empty = ({ title, hint }) => (
  <View style={{ alignItems: 'center', padding: 32 }}>
    <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 18, color: colors.ink, marginBottom: 4 }}>{title}</Text>
    {hint && <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>{hint}</Text>}
  </View>
)

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.marble },
  body: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center' },
  muted: { color: colors.muted },
  small: { fontSize: 13 },
})
