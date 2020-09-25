import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system"
import { RecordingOptions } from "expo-av/build/Audio";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Collection, Person } from "../types";
var Duration = require("duration");

const customRecordingOptions: RecordingOptions = {
  android: {
    extension: ".wav",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

const PersonCard = ({ person }: { person: Person }) => {
  const [name, setName] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [latestRecording, setLatestRecording] = useState<Audio.Recording>();
  const [duration, setDuration] = useState<string>("00.000");
  const [newWordModalVisible, setNewWordModalVisible] = useState<boolean>(
    false
  );
  const [newWord, setNewWord] = useState<string>("");

  useEffect(() => {
    setName(person.name);
    setCollections(person.collections);
  }, [person]);

  useEffect(() => {
    var interval: any;
    if (isRecording) {
      let dur1 = new Date();
      interval = setInterval(() => {
        let dur2 = new Date();
        let time = new Duration(dur1, dur2);
        let secs = time.seconds;
        let millis = Math.floor(time.milliseconds % 1000).toString();
        while (millis.toString().length < 3) millis = "0" + millis;
        let durStr = (secs < 10 ? "0" + secs : secs) + "." + millis;
        setDuration(durStr);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    await Audio.getPermissionsAsync()
      .then(async (val) => {
        if (val.granted) {
          setDuration("loading recorder...");
          // permission already granted
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          });
          const recording = new Audio.Recording();
          setLatestRecording(recording);
          try {
            await recording.prepareToRecordAsync(customRecordingOptions);
            await recording.startAsync();
            setIsRecording(true);
            setDuration("00.000");
            console.log("recording..");
          } catch (err) {
            console.log(err);
          }
        } else {
          // need permission
          await Audio.requestPermissionsAsync()
            .then((val) => {
              console.log(
                `Audio permission expires: ${val.expires.toString()}`
              );
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        await latestRecording?.stopAndUnloadAsync();
        setIsRecording(false);
        console.log("stopping an ongoing recording..");
        // location of the recording, to be used to upload
        // const source = latestRecording?.getURI();
        // console.log(source);
        console.log((await latestRecording?.getStatusAsync())?.durationMillis);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const playRecording = async () => {
    await latestRecording
      ?.createNewLoadedSoundAsync()
      .then(async (val: any) => {
        await val.sound.playAsync();
      });
  }

  const sendRecording = async () => {
    // sending wav file here to machine learning api
    // expecting text back as response
    const fileUri = latestRecording?._uri == undefined ? "" : latestRecording?._uri;
    console.log(fileUri);
    // let formData = new FormData();
    // formData.append("wavFile", uri)
    // let requestOptions: RequestInit = {
    //   method: "POST",
    //   body: formData,
    //   redirect: "follow"
    // }
    // try {
    //   fetch("https://stark-ravine-42131.herokuapp.com/predict", requestOptions)
    //     .then(res => res.text())
    //     .then(result => console.log(result))
    //     .catch(err => console.log(err))
    // } catch (err) {
    //   console.log(err)
    // }
    const apiUrl: string = "https://stark-ravine-42131.herokuapp.com/predict";
    
    await FileSystem.uploadAsync(apiUrl, fileUri, {
      httpMethod: 'POST',
    }).then(res => {
      console.log(res.status)
      console.log(res.body)
    }).catch(err => console.log(err))
  }

  const resetRecording = () => {
    setLatestRecording(undefined);
    setDuration("00.000");
  };

  return (
    <View style={styles.card}>
      <Modal transparent visible={newWordModalVisible} animationType="slide">
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
              placeholder="Enter word here.."
              style={{
                padding: 15,
                width: "90%",
                textAlign: "center",
                fontSize: 16,
                marginBottom: 10,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "lightgray",
              }}
              onChangeText={(text) => setNewWord(text)}
            />

            <Text
              style={{
                fontSize: 27.5,
                fontWeight: "500",
                margin: 7.5,
                textAlign: "center",
              }}
            >
              {duration}
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isRecording ? "black" : "#ed5564",
                  margin: 20,
                  marginTop: 0,
                  width: "90%",
                },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "500",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {isRecording ? "Stop" : "Record Initial Sample"}
              </Text>
            </TouchableOpacity>

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
                  setNewWord("");
                  setNewWordModalVisible(false);
                  resetRecording();
                }}
              />
              <Button
                title="Upload"
                color="green"
                disabled={
                  !latestRecording?._isDoneRecording || newWord.length === 0
                }
                onPress={() => {
                  let newCollection: Collection = {
                    label: newWord,
                    recordings: [latestRecording],
                  };
                  let temp = collections
                    ? [newCollection, ...collections]
                    : [newCollection];
                  // console.log(temp.length);
                  setCollections(temp);
                  setNewWord("");
                  setNewWordModalVisible(false);
                  // upload the wav file.
                  // resetRecording();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.name}>{name}</Text>
        <TouchableOpacity
          style={{ padding: 2.5 }}
          onPress={() => {
            setNewWord("");
            setNewWordModalVisible(true);
            resetRecording();
          }}
        >
          <Ionicons
            style={{ marginTop: 12.5, marginRight: 22.5 }}
            name="md-add"
            size={35}
            color="black"
          />
        </TouchableOpacity>
      </View>
      {collections ? (
        <>
          <ScrollView
            horizontal
            style={{ margin: 20, marginVertical: 0 }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {collections.map((collection, index) => (
              <TouchableOpacity
                style={styles.wordCard}
                key={collection.label}
                onPress={() => {
                  // open modal filled with recordings?
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 17, fontWeight: "500" }}
                >
                  {collection.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View>
            <Text
              style={{
                fontSize: 27.5,
                fontWeight: "500",
                margin: 7.5,
                textAlign: "center",
              }}
            >
              {duration}
            </Text>
          </View>
          {latestRecording?._isDoneRecording ? (
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#00bb9e",
                    margin: 20,
                    marginTop: 0,
                  },
                ]}
                onPress={sendRecording}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "500",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Translate
              </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "black",
                    margin: 20,
                    marginTop: 0,
                  },
                ]}
                onPress={playRecording}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "500",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Play Recording
              </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isRecording ? "black" : "#ed5564",
                margin: 20,
                marginTop: 0,
              },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "500",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {isRecording ? "Stop" : latestRecording?._isDoneRecording ? "Re-Listen" : "Listen"}
            </Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

export default PersonCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  modalContentView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    paddingBottom: 15,
    width: "90%",
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
  button: {
    padding: 15,
    backgroundColor: "#5c9ded",
    borderRadius: 10,
  },
  name: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: "auto",
    marginBottom: "auto",
    fontWeight: "500",
    color: "black",
    fontSize: 17.5,
  },
  wordCard: {
    padding: 25,
    backgroundColor: "black",
    margin: 5,
    borderRadius: 10,
    height: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
});
