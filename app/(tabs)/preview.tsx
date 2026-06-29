import { router, useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { imageToBase64 } from "../../lib/gemini";

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams();

  async function goAnalyze(promptKey: "academic" | "safety" | "inventory") {
    const base64Image = await imageToBase64(photoUri as string);

    router.push({
      pathname: "/result",
      params: {
        base64Image,
        promptKey,
      },
    });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri as string }} style={styles.preview} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => router.replace("/camera")}
        >
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.personaRow}>
        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => goAnalyze("academic")}
        >
          <Text style={styles.buttonText}>Academic Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => goAnalyze("safety")}
        >
          <Text style={styles.buttonText}>Safety Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => goAnalyze("inventory")}
        >
          <Text style={styles.buttonText}>Inventory Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  preview: {
    flex: 1,
    resizeMode: "contain",
  },

  actionRow: {
    padding: 20,
  },

  retakeButton: {
    backgroundColor: "#5A6472",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  personaRow: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },

  personaButton: {
    backgroundColor: "#5B3FA3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
