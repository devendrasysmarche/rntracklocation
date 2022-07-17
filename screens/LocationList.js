import * as React from 'react';
import {
    FlatList,
    Text,StyleSheet, View
} from 'react-native';
import { getDBConnection, getTodoItems } from '../services/Db';

const LocationList = ({ navigation }) => {
    const [getList, setGetList] = React.useState([]);
    // sql store sample
    const loadDataCallback = React.useCallback(async () => {
        // console.log('db0');
        try {
            // console.log('db');
            // const initTodos = [
            //     { id: 0, value: 'go to shop' }, 
            //     { id: 1, value: 'eat at least a one healthy foods' }, 
            //     { id: 2, value: 'Do some exercises' }
            // ];
            // console.log('iniTodos', initTodos);
            const db = await getDBConnection();

            // const dbt = await deleteTable(db)
            // console.log('db', db);
            // await createTable(db);
            const storedTodoItems = await getTodoItems(db);
            if (storedTodoItems.length > 0) {
                console.log('data in if', storedTodoItems);
                setGetList(storedTodoItems)
            }
        } catch (error) {
            console.log('error in dbquery',error);
        }
    }, []);

    React.useEffect(() => {
      loadDataCallback();
    }, []);
    // sql store

    return (
        <FlatList
            style={{
                flex: 1
            }}
            ListHeaderComponent={()=>{
                return <>
                    <Text style={{fontWeight: 'bold', alignItems: 'center', textAlign: 'center', marginVertical: '5%'}}>{'Delivery Boy Location List'}</Text>  
                </>
            }}
            ListEmptyComponent={()=>{
                return <>
                    <Text style={{fontWeight: 'bold', alignItems: 'center', textAlign: 'center', marginVertical: '5%'}}>{'Loading...'}</Text>  
                </>
            }}
            ListFooterComponent={()=>{
                return <>
                    <Text style={{fontWeight: 'bold', alignItems: 'center', textAlign: 'center', marginVertical: '5%'}}>{'Delivery Boy Location List'}</Text>  
                </>
            }}
            data={getList}
            keyExtractor={item => "ID"+Math.random()+item.index}
            renderItem={({item})=> {
                return <>
                    <View style={styles.item}>
                        <Text style={styles.title}>ID: {item?.id} {'&'} Order Id: {item?.orderid} </Text>
                        <Text style={styles.title}>Latitude: {item?.latitude}</Text>
                        <Text style={styles.title}>Longitude: {item?.longitude}</Text>
                        <Text style={styles.subtitle}>Timestamp: {item?.timestamp}</Text>
                        <Text style={styles.subtitle}>Created: {item?.created}</Text>
                    </View>
                </>
            }}
        />
    );
};
const styles = StyleSheet.create({
  item: {
    backgroundColor: '#7998ae',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5
  },
  title: {
    fontSize: 16,
    color: '#fff'
  },
  subtitle: {
    fontSize: 10,
    color: '#fff'
  },
});

export default LocationList;