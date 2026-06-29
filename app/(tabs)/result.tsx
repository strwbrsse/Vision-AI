import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
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
  const { base64Image, promptKey } = useLocalSearchParams();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const prompt = PROMPTS[(promptKey as keyof typeof PROMPTS) ?? "academic"];

      const result = await analyzeImage(base64Image as string, prompt);

      let textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textPart) {
        throw new Error("Empty response from Gemini");
      }

      // Remove Markdown code fences if Gemini returns them
      textPart = textPart
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: Analysis = JSON.parse(textPart);

      setAnalysis(parsed);
    } catch (err) {
      console.log(err);
      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
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
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Objects</Text>

      {analysis.objects.map((obj, index) => (
        <Text key={index} style={styles.listItem}>
          • {obj}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Context</Text>
      <Text style={styles.bodyText}>{analysis.context}</Text>

      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.bodyText}>{analysis.activities}</Text>

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.bodyText}>{analysis.recommendations}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    color: "#5A6472",
  },

  errorText: {
    color: "#B3261E",
    textAlign: "center",
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 18,
    color: "#1F2A44",
  },

  listItem: {
    fontSize: 16,
    marginTop: 6,
  },

  bodyText: {
    fontSize: 16,
    marginTop: 6,
    color: "#2B2F38",
  },
});
