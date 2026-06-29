import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
        }}
      />

      <Tabs.Screen
        name="preview"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="result"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
