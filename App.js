/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {fromJS, Map, List} from 'immutable';
import cardData from './cards_small';
console.info(typeof cardData);
const cards = cardData.reduce((cardSet, card) => {
  return cardSet.set(card.id, fromJS(card));
}, Map({}));

// find the largest number in the text
const detectTotal = blocks => {
  const allStrings = blocks.reduce(
    (allText, block) => allText.concat(block.value),
    '',
  );
  console.log('detectTotal.allStrings', allStrings);
  const rNumbers = /R\d+.?\d+/gm;
  const matches = Array.from(allStrings.matchAll(rNumbers), m =>
    m[0].replace('R', ''),
  );
  const sortedMatches = matches
    .reduce((a, m) => {
      console.log(`${m} => ${parseFloat(m)}`);
      if (parseFloat(m) !== undefined) {
        return a.concat(parseFloat(m));
      }
      return a;
    }, [])
    .sort((a, b) => {
      const aNumber = parseFloat(a);
      const bNumber = parseFloat(b);
      return aNumber - bNumber;
    });
  console.log('detectTotal.matches.Highest', sortedMatches.reverse());
};

const App = () => {
  const [detectedTextBlocks, setDetectedTextBlocks] = useState(List([]));
  const [cameraPaused, setCameraPaused] = useState(false);

  console.info('detectedTextBlocks', detectedTextBlocks.toJS());

  const takePicture = async () => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
      this.camera.pausePreview();
      setCameraPaused(true);
    }
  };

  const resumeCamera = () => {
    console.log('resumeCamera', cameraPaused);
    if (this.camera) {
      this.camera.resumePreview();
      setCameraPaused(false);
    }
  };

  return (
    <Fragment>
      <StatusBar transparent barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            onTextRecognized={response => {
              if (cameraPaused) {
                return;
              }
              if (response.textBlocks.length === 0) {
                return;
              }
              console.log('textBlocks', response);
              if (response.textBlocks.length > 0) {
                setDetectedTextBlocks(fromJS(response.textBlocks));
                detectTotal(response.textBlocks);
              }
            }}>
            {detectedTextBlocks
              .map((block, index) => (
                <View
                  key={`block_${index}`}
                  style={{
                    backgroundColor: '#FF000044',
                    position: 'absolute',
                    left: block.getIn(['bounds', 'origin', 'x']),
                    top: block.getIn(['bounds', 'origin', 'y']),
                    height: block.getIn(['bounds', 'size', 'height']),
                    width: block.getIn(['bounds', 'size', 'width']),
                    borderWidth: 1,
                    borderColor: 'black',
                  }}
                />
              ))
              .toArray()}
            <TouchableOpacity
              onPress={cameraPaused ? resumeCamera : takePicture}
              style={styles.capture}>
              <Text style={{fontSize: 14}}>
                {cameraPaused ? 'RETRY' : 'SNAP'}{' '}
              </Text>
            </TouchableOpacity>
          </RNCamera>
        </View>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'red',
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  text: {
    shadowColor: 'black',

    color: 'white',
    fontSize: 16,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default App;
