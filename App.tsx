import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Person } from "./types";
import PersonCard from "./components/PersonCard";

/*
  TO DO:
  - I should be able to add a new person
  - I should be able to add recordings specific to that person's collection

  screens:
  - main screen
  components:
  - add new person button
  - 'bob's collection'
  - add new recording button
  - 'recording #3'
*/

export default function App() {
  const [persons, setPersons] = useState<Person[]>([
    {
      name: "Charlie",
      collections: [
        { label: "Food", recordings: [] },
        { label: "Homework", recordings: [] },
        { label: "Class", recordings: [] },
        { label: "Dog", recordings: [] },
        { label: "School", recordings: [] },
      ],
    },
    {
      name: "Billy",
      collections: [
        { label: "Breakfast", recordings: [] },
        { label: "Goodbye", recordings: [] },
        { label: "Dinner", recordings: [] },
      ],
    },
    {
      name: "Tom",
      collections: [
        { label: "Room", recordings: [] },
        { label: "School", recordings: [] },
        { label: "Phone", recordings: [] },
      ],
    },
  ]);
  const [newPerson, setNewPerson] = useState<string>("");
  const [newPersonModalVisible, setNewPersonModalVisible] = useState<boolean>(
    false
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{ flexDirection: "row", width: "100%", alignItems: "baseline" }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 20,
            marginRight: "auto",
            marginLeft: 30,
            alignSelf: "flex-end",
          }}
        >
          Home
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            {
              padding: 12.5,
              marginTop: 20,
              marginLeft: "auto",
              marginRight: 30,
            },
          ]}
          onPress={() => setNewPersonModalVisible(!newPersonModalVisible)}
        >
          <Text
            style={{
              color: "white",
            }}
          >
            Add Person +
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 1,
          width: "85%",
          backgroundColor: "lightgray",
          marginVertical: 7.5,
        }}
      ></View>

      <Modal transparent visible={newPersonModalVisible} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <View style={styles.modalContentView}>
            <TextInput
              placeholder="Enter name here"
              style={{
                padding: 15,
                width: 175,
                textAlign: "center",
                fontSize: 16,
                marginBottom: 10,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "lightgray",
              }}
              onChangeText={(text) => setNewPerson(text)}
            />
            <View
              style={{
                flexDirection: "row",
                width: 200,
                justifyContent: "space-between",
              }}
            >
              <Button
                title="Cancel"
                color="red"
                onPress={() => {
                  setNewPerson("");
                  setNewPersonModalVisible(false);
                }}
              />
              <Button
                title="Done"
                color="green"
                onPress={() => {
                  console.log(newPerson);
                  let temp: Person[] = [...persons];
                  temp.unshift({ name: newPerson });
                  setPersons(temp);
                  setNewPersonModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ width: "100%", paddingHorizontal: 20 }}>
        {persons.map((person, index) => (
          <PersonCard person={person} key={index} />
        ))}
      </ScrollView>

      {/* <Text style={{ fontSize: 27.5, fontWeight: "500", margin: 7.5 }}>
        {duration}
      </Text>
      <TouchableOpacity
        style={[
          {
            backgroundColor: "#ed5564",
            padding: 15,
            borderRadius: 100,
            marginBottom: 20,
          },
        ]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={{ textAlign: "center", fontSize: 55 }}>
          {isRecording ? "✋" : "🎙"}
        </Text>
      </TouchableOpacity> */}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: 15,
    backgroundColor: "#5c9ded",
    borderRadius: 10,
  },
  modalContentView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    paddingBottom: 15,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
