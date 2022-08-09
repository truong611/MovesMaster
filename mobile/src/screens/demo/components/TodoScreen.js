import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Textbox from './Textbox';
import Todos from './Todos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoScreen = ({isPublic, navigate}) => {

  // session variable
  const [sessionInfo, setSessionInfo] = useState({
    id: null,
    token: null,
    name: null,
  });

  const {id, token, name} = sessionInfo;

  const fetchSession = async () => {
    const sessionString = await AsyncStorage.getItem('@todo-graphql:session');
    const session = JSON.parse(sessionString);
    // set session details in state
    setSessionInfo(session);
  };

  // fetch session on first mount
  React.useEffect(() => {
    fetchSession();
  }, []);

  if (!token) {
    return <ActivityIndicator/>;
  }

  // provide session details to children components
  return (
    <View style={styles.container}>
      <Textbox
        isPublic={isPublic}
        navigate={navigate}
        userId={id}
        username={name}
        token={token}
      />
      <View
        style={styles.todoListContainer}
      >
        <Todos
          isPublic={isPublic}
          navigate={navigate}
          userId={id}
          username={name}
          token={token}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'flex-start',
  },
  todoListContainer: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
});

export default TodoScreen;
