/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/Home';
import DeliveryStart from './screens/DeliveryStart';
import TrackByUser from './screens/TrackByUser';
import LocationList from './screens/LocationList';
import Leafletmap from './screens/Leafletmap';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome!' }}
        />
        <Stack.Screen
          name="DeliveryStart"
          component={DeliveryStart}
          options={{ title: 'Delivery Boy App' }}
        />
        <Stack.Screen name="LocationList" component={LocationList} options={{ title: 'Track Delivery Location List' }} />
        <Stack.Screen name="TrackByUser" component={TrackByUser} options={{ title: 'User Tracking Delivery Boy' }} />
        <Stack.Screen name="Leafletmap" component={Leafletmap} options={{ title: 'Leafletmap Tracking' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
