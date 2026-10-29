import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useFonts } from '@expo-google-fonts/playfair-display'
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'
import { useFonts as useOutfit, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit'
import { View, ActivityIndicator, Text } from 'react-native'

import { AuthProvider, useAuth } from './src/AuthContext.js'
import { colors } from './src/theme.js'
import Login from './src/Login.js'
import Register from './src/Register.js'
import Home from './src/Home.js'
import Budget from './src/Budget.js'
import Vendors from './src/Vendors.js'
import Chat from './src/Chat.js'
import Invitations from './src/Invitations.js'
import Bookings from './src/Bookings.js'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.marble, primary: colors.roseDeep },
}

const TABS = [
  { name: 'Home', component: Home, icon: 'home' },
  { name: 'Budget', component: Budget, icon: 'wallet' },
  { name: 'Vendors', component: Vendors, icon: 'storefront' },
  { name: 'Chat', component: Chat, icon: 'chatbubble-hearts' },
  { name: 'Bookings', component: Bookings, icon: 'calendar' },
]

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.roseDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.line, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, size }) => <Ionicons name={TABS.find((t) => t.name === route.name)?.icon || 'heart'} size={size} color={color} />,
      })}
    >
      {TABS.map(({ name, component }) => <Tab.Screen key={name} name={name} component={component} />)}
    </Tab.Navigator>
  )
}

function Root() {
  const { user, booting } = useAuth()
  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.marble, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.roseDeep} />
        <Text style={{ color: colors.muted, marginTop: 10 }}>VidAI</Text>
      </View>
    )
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.marble } }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Invitations" component={Invitations} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const [playfairLoaded] = useFonts({ PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold })
  const [outfitLoaded] = useOutfit({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold })

  if (!playfairLoaded || !outfitLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.marble, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.roseDeep} />
      </View>
    )
  }

  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Root />
      </NavigationContainer>
    </AuthProvider>
  )
}
