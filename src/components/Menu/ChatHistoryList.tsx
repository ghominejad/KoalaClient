import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';
import { shallow } from 'zustand/shallow';

import ChatFolder from './ChatFolder';
import ChatHistory from './ChatHistory';
import ChatSearch from './ChatSearch';

import {
  ChatHistoryFolderInterface,
  ChatHistoryInterface,
  ChatInterface,
  FolderCollection,
} from '@type/chat';

const ChatHistoryList = () => {
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const setFolders = useStore((state) => state.setFolders);
  const chatTitles = useStore(
    (state) => state.chats?.map((chat) => chat.title),
    shallow
  );

  const [isHover, setIsHover] = useState<boolean>(false);
  const [chatFolders, setChatFolders] = useState<ChatHistoryFolderInterface>(
    {}
  );
  const [noChatFolders, setNoChatFolders] = useState<ChatHistoryInterface[]>(
    []
  );
  const [filter, setFilter] = useState<string>('');

  const chatsRef = useRef<ChatInterface[]>(useStore.getState().chats || []);
  const foldersRef = useRef<FolderCollection>(useStore.getState().folders);
  const filterRef = useRef<string>(filter);

  const updateFolders = useRef(() => {
    const _folders: ChatHistoryFolderInterface = {};
    const _noFolders: ChatHistoryInterface[] = [];
    const chats = useStore.getState().chats;
    const folders = useStore.getState().folders;
  
    Object.values(folders)
      .sort((a, b) => a.order - b.order)
      .forEach((f) => (_folders[f.id] = []));
  
    if (chats) {
      chats.forEach((chat, index) => {
        const _filterLowerCase = filterRef.current.toLowerCase();
        const _chatTitle = chat.title.toLowerCase();
        const _chatFolderName = chat.folder
          ? folders[chat.folder].name.toLowerCase()
          : '';
  
        // Check if the search term is in the chat title, folder name, or any message content
        const isMatch = _chatTitle.includes(_filterLowerCase) ||
          _chatFolderName.includes(_filterLowerCase) ||
          chat.messages.some(message => message.content.toLowerCase().includes(_filterLowerCase));
  
        if (!isMatch && index !== useStore.getState().currentChatIndex) {
          return;
        }
  
        if (!chat.folder) {
          _noFolders.push({ title: chat.title, index: index, id: chat.id });
        } else {
          if (!_folders[chat.folder]) _folders[_chatFolderName] = [];
          _folders[chat.folder].push({
            title: chat.title,
            index: index,
            id: chat.id,
          });
        }
      });
    }
  
    setChatFolders(_folders);
    setNoChatFolders(_noFolders);
  }).current;

  useEffect(() => {
    updateFolders();

    useStore.subscribe((state) => {
      if (
        !state.generating &&
        state.chats &&
        state.chats !== chatsRef.current
      ) {
        updateFolders();
        chatsRef.current = state.chats;
      } else if (state.folders !== foldersRef.current) {
        updateFolders();
        foldersRef.current = state.folders;
      }
    });
  }, []);

  useEffect(() => {
    if (
      chatTitles &&
      currentChatIndex >= 0 &&
      currentChatIndex < chatTitles.length
    ) {
      // set title
      document.title = chatTitles[currentChatIndex];

      // expand folder of current chat
      const chats = useStore.getState().chats;
      if (chats) {
        const folderId = chats[currentChatIndex].folder;

        if (folderId) {
          const updatedFolders: FolderCollection = JSON.parse(
            JSON.stringify(useStore.getState().folders)
          );

          updatedFolders[folderId].expanded = true;
          setFolders(updatedFolders);
        }
      }
    }
  }, [currentChatIndex, chatTitles]);

  useEffect(() => {
    filterRef.current = filter;
    updateFolders();
  }, [filter]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      e.stopPropagation();
      setIsHover(false);

      const chatIndex = Number(e.dataTransfer.getData('chatIndex'));
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      delete updatedChats[chatIndex].folder;
      setChats(updatedChats);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHover(true);
  };

  const handleDragLeave = () => {
    setIsHover(false);
  };

  const handleDragEnd = () => {
    setIsHover(false);
  };

  return (
    <>
      <ChatSearch filter={filter} setFilter={setFilter} />
      <div
        className={`flex-col flex-1 overflow-y-auto hide-scroll-bar border-y-2 border-custom-white/40 ${
          isHover ? 'bg-neutral-dark/40' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
      >
        <div className='flex flex-col gap-2 text-custom-white text-sm pt-2'>
          {Object.keys(chatFolders).map((folderId) => (
            <ChatFolder
              folderChats={chatFolders[folderId]}
              folderId={folderId}
              key={folderId}
              filter={filter}
            />
          ))}
          {noChatFolders.map(
            ({ title, index, id }) =>
              (index == currentChatIndex ||
                !(
                  chatsRef.current[index].messages.length == 0 ||
                  (chatsRef.current[index].messages.length == 1 &&
                    chatsRef.current[index].messages[0].role == 'system')
                )) && (
                <ChatHistory
                  title={title}
                  key={`${title}-${id}`}
                  chatIndex={index}
                />
              )
          )}
        </div>
        <div className='w-full h-2' />
      </div>
    </>
  );
};

export default ChatHistoryList;
