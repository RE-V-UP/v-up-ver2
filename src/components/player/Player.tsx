'use client'
import addCurrMusic from '@/../public/images/community-detail-Image/add-current-music.svg'
import addMyPlayList from '@/../public/images/community-detail-Image/add-my-playlist.svg'
import musicLyricsButton from '@/../public/images/musicLyricsButton.svg'
import musicShuffle from '@/../public/images/musicShuffle.svg'
import musicShuffleOff from '@/../public/images/musicShuffleOff.svg'
import musicThumbnail from '@/../public/images/musicThumbnail.svg'
import musicThumbnailDefault from '@/../public/images/musicThumbnailDefault.svg'
import { useCustomListMusicStore } from '@/shared/store/playerStore'
import { PlayerProps } from '@/types/musicPlayer/types'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { ADD_CURRENT_MUSIC_SHADOW } from '../communityDetail/communityCss'
import './AudioCss.css'
import FaForward from './playerIcons/FaForward'
import MyLoopIcon from './playerIcons/MyLoopIcon'
import MyLoopOffIcon from './playerIcons/MyLoopOffIcon'
import MyNextIcon from './playerIcons/MyNextIcon'
import MyPauseIcon from './playerIcons/MyPauseIcon'
import MyPlayIcon from './playerIcons/MyPlayIcon'
import MyPreviousIcon from './playerIcons/MyPreviousIcon'

// 현재 플레이 컴포넌트
const Player = ({
  currentPlaying,
  setCurrentPlaying,
  isLyrics,
  isRandom,
  musicIndex,
  onPreviousHandler,
  onNextTrackHandler,
  onLyricsToggle,
  onInsertMyPlayListHandler,
  onRandomMusicHandler,
}: PlayerProps) => {
  const { customListData } = useCustomListMusicStore()
  const { customPlayList } = customListData

  // 현재 플레이어 리스트가 있으면 첫번째 인덱스를 현재 플레이 스테이트에 담아주고
  // 플레이 리스트가 없으면 현재 플레이중인음악도 삭제함으로 현재 재생곡 삭제 시 다음곡으로 넘어감
  useEffect(() => {
    if (!currentPlaying && customPlayList.length > 0) {
      setCurrentPlaying(customPlayList[0])
    } else if (currentPlaying && customPlayList.length === 0) {
      setCurrentPlaying(null)
    }
  }, [musicIndex, customPlayList, currentPlaying])

  // 플레이어 버튼 커스텀을 위한 컴포넌트 공식문서 기반으로 컴포넌트에 SVG를 담아 플레이어 라이브러리 속성에 커스텀 아이콘으로 넣어줌
  const customIcons = {
    play: <MyPlayIcon />,
    pause: <MyPauseIcon />,
    previous: <MyPreviousIcon onPreviousHandler={onPreviousHandler} />,
    next: <MyNextIcon onNextTrackHandler={onNextTrackHandler} />,
    loop: <MyLoopIcon />,
    loopOff: <MyLoopOffIcon />,
    progressJump: <FaForward />,
  }

  // LP 돌아감 + 그림자 애니메이션을위한REF
  const imageRef = useRef<HTMLImageElement>(null)

  const onStartAnimation = () => {
    if (imageRef.current) {
      const imageElement = imageRef.current
      imageElement.classList.add('rotate-with-shadow')
    }
  }

  const onStopAnimation = () => {
    if (imageRef.current) {
      const imageElement = imageRef.current
      imageElement.classList.remove('rotate-with-shadow')
    }
  }

  // 플레이어 라이브러이에 플레이 속성을 이용해 음악 플레이 시 애니메이션 적용
  const onplayHandler = (arg: any) => {
    setCurrentPlaying(arg)
    onStartAnimation()
  }

  // 플레이어 라이브러이에 퍼즈(일시정지) 속성을 이용해 음악 플레이 시 애니메이션 적용
  const onPauseHandler = () => {
    onStopAnimation()
  }

  return (
    <div>
      <div className='flex flex-col items-center'>
        <div className='mt-[40px] flex flex-col items-center gap-[8px] p-[0px]'>
          <div className=' text-center text-[18px] font-bold leading-[150%]  tracking-tighter text-white opacity-80'>
            {currentPlaying ? currentPlaying.musicTitle : 'V-UP'}
          </div>

          <div className='text-center text-[14px] leading-[150%] tracking-tighter text-white opacity-50'>
            {currentPlaying ? currentPlaying.artist : '-'}
          </div>
        </div>

        <div className='relative mt-[8px]'>
          {currentPlaying ? (
            <figure className='h-[276px] w-[276px]'>
              <Image
                src={musicThumbnail}
                alt='Album Circle'
                width={276}
                height={276}
                className='element rounded-full'
                ref={imageRef}
              />
            </figure>
          ) : (
            <figure className='h-[276px] w-[276px]'>
              <Image
                src={musicThumbnailDefault}
                alt='Album Circle'
                width={276}
                height={276}
                className='rounded-full object-center shadow-[0px_4px_4px_-5px_rgba(0,0,0,0.25)]'
              />
            </figure>
          )}
          {currentPlaying ? (
            <figure className='absolute left-[45px] top-[45px] h-[188px] w-[188px]'>
              <Image
                src={currentPlaying.thumbnail}
                alt='Album Thumbnail'
                width={188}
                height={188}
                className='rounded-full object-center'
              />
            </figure>
          ) : null}
        </div>

        <div className='mx-auto flex items-center px-[24px]'>
          <div className='flex w-[316px] justify-between'>
            <button onClick={onLyricsToggle} className='h-[48px] w-[48px]'>
              {isLyrics ? (
                <Image
                  src={addCurrMusic}
                  alt='Lyrics'
                  width={48}
                  height={48}
                  className={`flex items-center justify-center rounded-[100%] border border-solid border-[#292929] bg-[#292929] p-[8px] ${ADD_CURRENT_MUSIC_SHADOW} `}
                />
              ) : (
                <Image
                  src={musicLyricsButton}
                  alt='Lyrics'
                  width={48}
                  height={48}
                  className={`flex  items-center justify-center rounded-[100%] border border-solid border-[#292929] bg-[#292929] p-[8px] ${ADD_CURRENT_MUSIC_SHADOW}`}
                />
              )}
            </button>
            <button
              type='button'
              className={`flex h-[48px] w-[48px] items-center justify-center rounded-[100%] border border-solid border-[#292929] bg-[#292929] p-[8px] ${ADD_CURRENT_MUSIC_SHADOW}`}
              onClick={onInsertMyPlayListHandler}
            >
              <Image
                src={addMyPlayList}
                alt='마이플레이리스트에 저장 아이콘'
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </div>
      <div className='flex items-center'>
        <AudioPlayer
          src={currentPlaying ? currentPlaying.musicSource : ''}
          volume={0.5}
          loop={false}
          onEnded={onNextTrackHandler}
          showSkipControls={true}
          customIcons={customIcons}
          onPlay={() => {
            onplayHandler(currentPlaying)
          }}
          onPause={onPauseHandler}
        />
        <Image
          src={isRandom ? musicShuffleOff : musicShuffle}
          alt='shuffle'
          width={50}
          height={60}
          onClick={onRandomMusicHandler}
          className='absolute translate-x-[315px] translate-y-[99px] cursor-pointer'
        />
      </div>
    </div>
  )
}

export default Player
