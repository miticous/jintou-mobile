import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import reactotron from 'reactotron-react-native';
import ChatComponent from '../components/ChatComponent';
import DropDownHolder from '../../helpers/DropDownHolder';

const CHAT_SUB = gql`
  subscription updateChat {
    updateChat {
      participants {
        _id
        name
      }
      messages {
        _id
        text
        sender_id
        receiver_id
        sentAt
      }
    }
  }
`;
const GET_CHAT = gql`
  query GET_CHAT($targetUserId: String) {
    chat(targetUserId: $targetUserId) {
      participants {
        _id
        name
      }
      messages {
        _id
        text
        sender_id
        receiver_id
        sentAt
      }
    }
  }
`;
const SEND_MESSAGE = gql`
  mutation($targetUserId: String, $message: String) {
    sendMessage(targetUserId: $targetUserId, message: $message) {
      participants {
        _id
        name
      }
      messages {
        _id
        text
        sender_id
        receiver_id
        sentAt
      }
    }
  }
`;

const ChatContainer = ({ navigation }) => {
  const [state, setState] = useState({});

  useQuery(GET_CHAT, {
    onCompleted: ({ chat }) => setState({ ...state, chat: { ...chat } }),
    variables: {
      targetUserId: '5e4b9a07b7ed304118ae2372'
    }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: () => DropDownHolder.show('error', '', 'Falha ao enviar/receber mensagens')
  });

  useSubscription(CHAT_SUB, {
    onSubscriptionData: ({
      subscriptionData: {
        data: { updateChat }
      }
    }) => setState({ ...state, chat: { ...updateChat } })
  });

  useEffect(() => {
    AsyncStorage.getItem('@jintou:userId').then(res => {
      setState({ ...state, userId: res });
    });
  }, []);
  const { chat, userId } = state;
  reactotron.log(state);
  // const { name } = chat ? chat.participants.find(participant => participant._id !== userId) : '';

  return (
    <ChatComponent
      // loading={mutationLoading}
      // participant={name}
      messages={chat && chat.messages}
      userId={userId}
      inputValue={state.inputValue}
      onChangeInput={text => setState({ ...state, inputValue: text })}
      onSubmit={() => {
        sendMessage({
          variables: {
            targetUserId: '5e4b9a07b7ed304118ae2372',
            message: state.inputValue
          }
        });
        setState({ ...state, inputValue: '' });
      }}
    />
  );
};

export default ChatContainer;
