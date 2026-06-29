import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ResultScreen() {
  const { base64Image } = useLocalSearchParams();

  console.log("Received Base64:", (base64Image as string)?.length);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Result Screen</Text>

      <Text>Base64 received successfully!</Text>
    </View>
  );
}
