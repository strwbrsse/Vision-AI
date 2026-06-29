import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { analyzeImage, PROMPTS } from "../../lib/gemini";

interface Analysis {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string;
}

export default function ResultScreen() {
  const { imageUri, base64Image, promptKey } = useLocalSearchParams();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const prompt = PROMPTS[(promptKey as keyof typeof PROMPTS) ?? "academic"];

      const result = await analyzeImage(base64Image as string, prompt);

      if (result.error) {
        throw new Error(result.error.message);
      }

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: Analysis = JSON.parse(cleanText);

      setAnalysis(parsed);
    } catch (err: any) {
      console.log(err);

      if (err.message?.includes("503")) {
        setError(
          "The AI service is currently busy.\n\nPlease try again in a few moments.",
        );
      } else {
        setError(err.message ?? "Unable to analyze image.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />

        <Text style={styles.loadingTitle}>
          🤖 VisionAI is analyzing your image...
        </Text>

        <Text style={styles.loadingSubtitle}>Please wait a few seconds.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/camera")}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.centered}>
        <Text>No analysis available.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>VisionAI Results</Text>

        <Text style={styles.modeBadge}>
          {String(promptKey).toUpperCase()} MODE
        </Text>

        {imageUri ? (
          <Pressable onPress={() => setShowImage(true)}>
            <Image
              source={{ uri: imageUri as string }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detected Objects</Text>

          {analysis.objects.length > 0 ? (
            analysis.objects.map((obj, index) => (
              <Text key={index} style={styles.listItem}>
                • {obj}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>No objects detected.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Context</Text>

          <Text style={styles.bodyText}>{analysis.context}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activities</Text>

          <Text style={styles.bodyText}>{analysis.activities}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommendations</Text>

          <Text style={styles.bodyText}>{analysis.recommendations}</Text>
        </View>

        <TouchableOpacity
          style={styles.analyzeAgainButton}
          onPress={() => router.replace("/camera")}
        >
          <Text style={styles.analyzeAgainText}>📷 Analyze Another Image</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showImage} animationType="fade" transparent>
        <Pressable
          style={styles.modalContainer}
          onPress={() => setShowImage(false)}
        >
          <Image
            source={{ uri: imageUri as string }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          <Text style={styles.closeText}>Tap anywhere to close</Text>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F7FB",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2A44",
    marginBottom: 10,
  },

  loadingTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2A44",
    textAlign: "center",
  },

  loadingSubtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  errorText: {
    fontSize: 17,
    color: "#B3261E",
    textAlign: "center",
    lineHeight: 24,
  },

  retryButton: {
    marginTop: 25,
    backgroundColor: "#5B3FA3",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  modeBadge: {
    alignSelf: "center",
    backgroundColor: "#5B3FA3",
    color: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    fontWeight: "bold",
    marginBottom: 18,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 260,
    borderRadius: 18,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2A44",
    marginBottom: 12,
  },

  bodyText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 25,
  },

  listItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },

  analyzeAgainButton: {
    backgroundColor: "#5B3FA3",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  analyzeAgainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "80%",
  },

  closeText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
  },
});
