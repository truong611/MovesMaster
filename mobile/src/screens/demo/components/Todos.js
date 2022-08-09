import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import TodoItem from './TodoItem';
import LoadOlder from './LoadOlder';
import LoadNewer from './LoadNewer';
import {useQuery} from '@apollo/react-hooks';
import {withApollo} from 'react-apollo';
import CenterSpinner from '../../../components/center-spinner/center-spinner';
import {FETCH_TODOS, SUBSCRIBE_TO_NEW_TODOS} from '../demo-service';

const Todos = ({isPublic, ...props}) => {

  const [newTodosExist, setNewTodosExist] = React.useState(false);

  const subscribeToNewTodos = () => {
    const {client} = props;
    if (isPublic) {
      client.subscribe({
        query: SUBSCRIBE_TO_NEW_TODOS,
      }).subscribe({
        next: (event) => {
          if (event.data.todos.length) {
            let localData;
            try {
              localData = client.readQuery({
                query: FETCH_TODOS,
                variables: {
                  isPublic: true,
                },
              });
            } catch (e) {
              return;
            }

            const lastId = localData.todos[0] ? localData.todos[0].id : 0;
            if (event.data.todos[0].id > lastId) {
              setNewTodosExist(true);
            }
          }
        },
        error: (err) => {
          console.error('err', err);
        },
      });
    }
  };
  React.useEffect(subscribeToNewTodos, []);

  const dismissNewTodoBanner = () => {
    setNewTodosExist(false);
  };

  const {data, error, loading} = useQuery(
    FETCH_TODOS,
    {
      variables: {isPublic},
    },
  );

  if (error) {
    console.error(error);
    return <Text>Error</Text>;
  }

  if (loading) {
    return <CenterSpinner/>;
  }

  return (
    <View style={styles.container}>
      <LoadNewer show={newTodosExist && isPublic} toggleShow={dismissNewTodoBanner} styles={styles}
                 isPublic={isPublic}/>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContainer}>
        <FlatList
          data={data.todos}
          renderItem={({item}) => <TodoItem item={item} isPublic={isPublic}/>}
          keyExtractor={(item) => item.id.toString()}
        />
        <LoadOlder
          isPublic={isPublic}
          styles={styles}
        />
      </ScrollView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 0.8,
    paddingHorizontal: 10,
    backgroundColor: '#F7F7F7',
  },
  scrollViewContainer: {
    justifyContent: 'flex-start',
  },
  banner: {
    flexDirection: 'column',
    backgroundColor: '#39235A',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  pagination: {
    flexDirection: 'row',
    backgroundColor: '#39235A',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    borderRadius: 5,
    marginBottom: 20,
    paddingVertical: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default withApollo(Todos);
