/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
// import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid, Platform, ToastAndroid, Linking, TouchableOpacity
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import BackgroundJob from 'react-native-background-actions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

BackgroundJob.on('expiration', () => {
  console.log('iOS: I am being closed!');
});

function getBackLoc() {
  return new Promise((resolve, reject)=> {  
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location Received In Background:',position);
        resolve(position)
      },
      (error) => {
        console.log('Error received:',error);
        resolve(error.toString())
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
      },
    );
  })
}

const taskRandom = async (taskData) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.'
    );
  }
  await new Promise(async (resolve) => {
    // For loop with a delay
    const { delay } = taskData;
    console.log(BackgroundJob.isRunning(), delay)
    for (let i = 0; BackgroundJob.isRunning(); i++) {
      let getloc = await getBackLoc().catch(e=>console.log('error', e)) // .then(d=> {
        // (async()=>{
          // let getloc = d
          console.log('Runned -> ', i, getloc);
          await BackgroundJob.updateNotification({ taskDesc: 'Runned -> ' + i + ' & Details: '+ JSON.stringify(getloc) });
          await sleep(delay);
        // })()
      // }).catch(e=>{
      //   // (async()=>{
      //     let getloc = e
      //     console.log('RunnedCatch -> ', i, getloc);
      //     await BackgroundJob.updateNotification({ taskDesc: 'RunnedCatch -> ' + i + ' & Details: '+ JSON.stringify(getloc) });
      //     await sleep(delay);
      //   // })()
      // })
    }
  });
};

const options = {
  taskName: 'trackme',
  taskTitle: 'trackmeTask title',
  taskDesc: 'trackmeTask desc',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'trackme://chat/jane',
  parameters: {
    delay: 5000,
  },
};

function handleOpenURL(evt) {
  console.log('handleOpenURL', evt.url);
  // do something with the url
}

Linking.addEventListener('url', handleOpenURL);


const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';


  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = ()  => {
  const isDarkMode = useColorScheme() === 'dark';
  const [locationDetails, setlocationDetails] = React.useState(null);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  let playing = BackgroundJob.isRunning();

  /**
   * Toggles the background task
   */
  const toggleBackground = async () => {
    playing = !playing;
    if (playing) {
      try {
        console.log('Trying  to start background service');
        await BackgroundJob.start(taskRandom, options);
        console.log('Successful start!');
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      console.log('Stop background service');
      await BackgroundJob.stop();
    }
  };

  React.useEffect(() => {
    console.log('isBackground', playing);
    requestLocationPermission(true)
    return () => {
      
    };
  }, []);

  async function requestLocationPermission(input = false) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location ACCESS_FINE_LOCATION Permission",
          message:
            "App needs access to your location fine",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the ACCESS_FINE_LOCATION");

        const granted2 = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: "Location ACCESS_COARSE_LOCATION Permission",
            message:
              "App needs access to your location coarse",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted2 === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the ACCESS_COARSE_LOCATION");

          const granted3 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: "Location ACCESS_BACKGROUND_LOCATION Permission",
              message:
                "App needs access to your location coarse",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted3 === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the ACCESS_BACKGROUND_LOCATION");
            getLoc(input)
          } else {
            console.log("ACCESS_BACKGROUND_LOCATION permission denied");
          }

        } else {
          console.log("ACCESS_COARSE_LOCATION permission denied");
        }

      } else {
        console.log("ACCESS_FINE_LOCATION permission denied");
      }
    } catch (err) {
      console.warn('Oops!',err);
    }
  };

  async function getLoc(input = false) {
    // const check = hasLocationPermission()
    // if (check) {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location Received:',position);
          if (input) {
            setlocationDetails(position)
          }
        },
        (error) => {
          console.log('Error received:',error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000,
          distanceFilter: 0,
          forceRequestLocation: true,
          forceLocationManager: false,
          showLocationDialog: true,
        },
      );
    // } else {
    //   ToastAndroid.show(
    //     'Location permission not allowed by you.',
    //     ToastAndroid.LONG,
    //   );
    // }
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="About">
            Hello there!, Background Location  <Text style={styles.highlight}>Detection</Text>
          </Section>
          <Text>
            {JSON.stringify(locationDetails, null, 2)}
          </Text>
          <View>
          <TouchableOpacity
              style={{ height: 100, width: 100, backgroundColor: 'red' }}
              onPress={toggleBackground}><Text>Press for BGTask</Text></TouchableOpacity>
          </View>
          
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
