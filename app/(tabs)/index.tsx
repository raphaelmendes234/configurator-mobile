import Manager from "@/components/Manager";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Hey</Text>
      <Button
        title="Envoyer"
        onPress={() => sendMessage("Hello test 2")}
      /> */}
      <Manager></Manager>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071031",
  },
  text: {
    fontSize: 24,
    color: "#fff",
  },
});
