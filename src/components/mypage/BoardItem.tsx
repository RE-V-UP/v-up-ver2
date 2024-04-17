import type { Board } from '@/types/mypage/types'
import { onDateHandler } from '@/util/util'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import play from '@/../public/images/play.svg'
import heart from '@/../public/images/heart-rounded-gray.svg'
import message from '@/../public/images/message-text-square-02-gray.svg'

const BoardItem = ({
  data: item,
  onClick,
}: {
  data: Board
  onClick: () => void
}) => {
  return (
    <li className='flex justify-between gap-8 border-b border-solid border-black p-4'>
      <div className='flex w-[calc(100%-94px)] items-center gap-4'>
        <figure className='flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-2 border-[#ffffff1a] bg-[#2b2b2b]'>
          {item.userInfo?.userImage && (
            <Image
              src={item.userInfo.userImage}
              width={56}
              height={56}
              alt={`${item.userInfo.nickname} 프로필 이미지`}
            />
          )}
        </figure>
        <div className='w-[calc(100%-70px)]'>
          <Link
            href={`/community/${item.boardId}`}
            className='text-[1rem] font-bold'
          >
            {item.boardTitle}
          </Link>

          <div className='mt-2 flex justify-between text-[0.875rem] text-[#ffffff7f]'>
            <div>
              <strong className='pr-4'>{item.userInfo?.nickname}</strong>
              {onDateHandler(item.date)}
            </div>
            <div className='flex items-center gap-1'>
              <Image src={heart} width={18} height={18} alt='좋아요 아이콘' />{' '}
              {item.likeList ? item.likeList.length : 0}
              <Image
                src={message}
                width={18}
                height={18}
                className='ml-1'
                alt='댓글 아이콘'
              />{' '}
              {item.comment ? item.comment.length : 0}
            </div>
          </div>
        </div>
      </div>
      <div className='relative h-[84px] w-[84px] overflow-hidden rounded-full border-2 border-[#ffffff19]'>
        <figure>
          {item.musicInfo?.thumbnail && (
            <Image
              src={item.musicInfo.thumbnail}
              width={80}
              height={80}
              className='blur-sm'
              alt={`${item.musicInfo.musicTitle} 앨범 이미지`}
            />
          )}
        </figure>
        <button
          type='button'
          onClick={onClick}
          className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        >
          <Image src={play} width={24} height={24} alt='담기 버튼' />
        </button>
      </div>
    </li>
  )
}

export default BoardItem
