import * as React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,Button,
    PermissionsAndroid, Platform, ToastAndroid, Linking, TouchableOpacity
} from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView>
            <Text style={{fontWeight: 'bold', alignItems: 'center', textAlign: 'center', marginVertical: '5%'}}>{'Delivery Boy App'}</Text>
            <Button
                title="Go to Delivery Boy To Start Location"
                onPress={() =>
                    navigation.navigate('DeliveryStart', { name: 'DeliveryStart' })
                }
            />
            <Text>{' '}</Text>

            <Button
                title="Go to Delivery Boy Location List"
                onPress={() =>
                    navigation.navigate('LocationList', { name: 'LocationList' })
                }
            />
            <Text>{' '}</Text>

            <Text style={{fontWeight: 'bold', alignItems: 'center', textAlign: 'center', marginVertical: '5%'}}>{'User App'}</Text>
            <Button
                title="Go to User App"
                onPress={() =>
                    navigation.navigate('TrackByUser', { name: 'TrackByUser' })
                }
            />
            <Text>{' '}</Text>

            <Button
                title="Leafletmap App"
                onPress={() =>
                    navigation.navigate('Leafletmap', { name: 'Leafletmap' })
                }
            />
            <Text>{' '}</Text>

      </ScrollView>
    );
};

export default HomeScreen;