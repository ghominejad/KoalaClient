import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';

import DownChevronArrow from '@icon/DownChevronArrow';
import FolderIcon from '@icon/FolderIcon';
import {
  ChatHistoryInterface,
  ChatInterface,
  FolderCollection,
} from '@type/chat';

import ChatHistory from './ChatHistory';
import NewChat from './NewChat';
import EditIcon from '@icon/EditIcon';
import DeleteIcon from '@icon/DeleteIcon';
import CrossIcon from '@icon/CrossIcon';
import TickIcon from '@icon/TickIcon';
import ColorPaletteIcon from '@icon/ColorPaletteIcon';
import RefreshIcon from '@icon/RefreshIcon';

import { folderColorOptions } from '@constants/color';

import useHideOnOutsideClick from '@hooks/useHideOnOutsideClick';

const ChatFolder = ({
  folderChats,
  folderId,
  filter,
}: {
  folderChats: ChatHistoryInterface[];
  folderId: string;
  filter: string;
}) => {
  const folderName = useStore((state) => state.folders[folderId]?.name);
  const isExpanded = useStore((state) => state.folders[folderId]?.expanded);
  const color = useStore((state) => state.folders[folderId]?.color);

  const setChats = useStore((state) => state.setChats);
  const setFolders = useStore((state) => state.setFolders);

  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const [_folderName, _setFolderName] = useState<string>(folderName);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);

  const [showPalette, setShowPalette, paletteRef] = useHideOnOutsideClick();

  const editTitle = () => {
    const updatedFolders: FolderCollection = JSON.parse(
      JSON.stringify(useStore.getState().folders)
    );
    updatedFolders[folderId].name = _folderName;
    setFolders(updatedFolders);
    setIsEdit(false);
  };

  const deleteFolder = () => {
    const existingChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    let newChats: ChatInterface[] = [];

    existingChats.forEach((chat) => {
      if (chat.folder !== folderId) newChats.push(chat);
    });
    setChats(newChats);

    const updatedFolders: FolderCollection = JSON.parse(
      JSON.stringify(useStore.getState().folders)
    );
    delete updatedFolders[folderId];
    setFolders(updatedFolders);

    setIsDelete(false);
  };

  const updateColor = (_color?: string) => {
    const updatedFolders: FolderCollection = JSON.parse(
      JSON.stringify(useStore.getState().folders)
    );
    if (_color) updatedFolders[folderId].color = _color;
    else delete updatedFolders[folderId].color;
    setFolders(updatedFolders);
    setShowPalette(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editTitle();
    }
  };

  const handleTick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isEdit) editTitle();
    else if (isDelete) deleteFolder();
  };

  const handleCross = () => {
    setIsDelete(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      e.stopPropagation();

      // expand folder on drop
      const updatedFolders: FolderCollection = JSON.parse(
        JSON.stringify(useStore.getState().folders)
      );
      updatedFolders[folderId].expanded = true;
      setFolders(updatedFolders);

      // update chat folderId to new folderId
      const chatIndex = Number(e.dataTransfer.getData('chatIndex'));
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      updatedChats[chatIndex].folder = folderId;
      setChats(updatedChats);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = () => {};

  const toggleExpanded = () => {
    if (filter === '') {
      const updatedFolders: FolderCollection = JSON.parse(
        JSON.stringify(useStore.getState().folders)
      );
      updatedFolders[folderId].expanded = !updatedFolders[folderId].expanded;
      setFolders(updatedFolders);
    }
  };

  useEffect(() => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  }, [isEdit]);

  return (
    <div
      className={`w-full transition-colors group/folder`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        style={{ background: color || '' }}
        className={`${
          color
            ? 'border-custom-black/20'
            : 'hover:bg-custom-white/20 border-neutral-base'
        } border-2 transition-colors flex pl-2 items-center gap-3 relative rounded-md break-all cursor-pointer parent-sibling`}
        onClick={toggleExpanded}
        ref={folderRef}
        onMouseEnter={() => {
          if (color && folderRef.current) {
            folderRef.current.style.background = `${color}dd`;
          }
          if (gradientRef.current) gradientRef.current.style.width = '0px';
        }}
        onMouseLeave={() => {
          if (color && folderRef.current) {
            folderRef.current.style.background = color;
          }
          if (gradientRef.current) gradientRef.current.style.width = '1rem';
        }}
      >
        <div className='py-2'>
          <FolderIcon className='h-4 w-4' />
        </div>
        <div className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative'>
          {isEdit ? (
            <input
              type='text'
              className='focus:outline-blue-600 text-sm border-none bg-transparent p-0 m-0 w-full'
              value={_folderName}
              onChange={(e) => {
                _setFolderName(e.target.value);
              }}
              onBlur={() => {
                setIsEdit(false);
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
          ) : (
            _folderName
          )}
          {isEdit || (
            <div
              ref={gradientRef}
              className='absolute inset-y-0 right-0 w-4 z-10 transition-all'
              style={{
                background:
                  color &&
                  `linear-gradient(to left, ${
                    color || 'var(--color-900)'
                  }, rgb(32 33 35 / 0))`,
              }}
            />
          )}
        </div>
        {!isExpanded && filter === '' && (
          <div className='flex text-custom-white/60'>
            <button
              className='pr-3 hover:text-custom-white'
              aria-label='expand'
            >
              <DownChevronArrow />
            </button>
          </div>
        )}
        {isExpanded && filter === '' && (
          <div
            className='flex text-custom-white/60'
            onClick={(e) => e.stopPropagation()}
          >
            {isDelete ? (
              <>
                <button
                  className='p-1 hover:text-custom-white'
                  onClick={handleTick}
                  aria-label='confirm'
                >
                  <TickIcon />
                </button>
                <button
                  className='p-1 hover:text-custom-white'
                  onClick={handleCross}
                  aria-label='cancel'
                >
                  <CrossIcon />
                </button>
              </>
            ) : (
              <>
                {!isEdit && (
                  <button
                    className='p-1 hover:text-neutral-dark hover:bg-custom-white/70 hover:rounded md:hidden group-hover/folder:md:inline'
                    onClick={() => setIsEdit(true)}
                    aria-label='edit folder title'
                  >
                    <EditIcon />
                  </button>
                )}
                <div
                  className='relative md:hidden group-hover/folder:md:inline'
                  ref={paletteRef}
                >
                  <button
                    className='p-1 hover:text-neutral-dark hover:bg-custom-white/70 hover:rounded md:hidden group-hover/folder:md:inline'
                    onClick={() => {
                      setShowPalette((prev) => !prev);
                    }}
                    aria-label='folder color'
                  >
                    <ColorPaletteIcon />
                  </button>
                  {showPalette && (
                    <div className='absolute bottom-0 translate-y-full p-2 z-20 bg-neutral-dark rounded border border-neutral-base flex flex-col gap-2 items-center'>
                      <>
                        {folderColorOptions.map((c) => (
                          <button
                            key={c}
                            style={{ background: c }}
                            className={`hover:scale-90 transition-transform h-6 w-6 rounded-full`}
                            onClick={() => {
                              updateColor(c);
                            }}
                            aria-label={c}
                          />
                        ))}
                        <button
                          onClick={() => {
                            updateColor();
                          }}
                          aria-label='default color'
                        >
                          <RefreshIcon />
                        </button>
                      </>
                    </div>
                  )}
                </div>
                <button
                  className='p-1 hover:text-neutral-dark hover:bg-custom-white/70 hover:rounded md:hidden group-hover/folder:md:inline'
                  onClick={() => setIsDelete(true)}
                  aria-label='delete folder'
                >
                  <DeleteIcon />
                </button>
                <button
                  className='p-1 hover:text-custom-white'
                  onClick={toggleExpanded}
                  aria-label='expand folder'
                ></button>
              </>
            )}
          </div>
        )}
      </div>
      <div className='ml-3 pl-1 border-l-2 border-neutral-base flex flex-col gap-1 parent'>
        {isExpanded && filter === '' && (
          <div className='pt-1'>
            <NewChat folder={folderId} />
          </div>
        )}
        {(isExpanded || filter !== '') &&
          folderChats.map((chat) => (
            <ChatHistory
              title={chat.title}
              chatIndex={chat.index}
              key={`${chat.title}-${chat.index}`}
            />
          ))}
      </div>
    </div>
  );
};

export default ChatFolder;
