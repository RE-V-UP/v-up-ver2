'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Businessman from '@/../public/images/Businessman.svg'
import ButtonPrimary from '../../util/ButtonPrimary'
import PreviousButton from '../mypage/PreviousButton'
import submitIcon from '@/../public/images/Icon.svg'
import { OPEN_ANOTHER_SHADOW } from '../login/loginCss'

import type { PersonalModal } from '@/types/personal/type'

const PersonalModalDetail = ({ isOpen, onClose }: PersonalModal) => {
  const router = useRouter()

  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user?.uid as string

  if (!isOpen) return null

  const onPersonalTestHandler = () => {
    if (!uid) {
      router.push('/login')
    } else {
      router.push('/personal-music')
      onCloseModalHandler()
    }
  }
  const onCloseModalHandler = () => {
    let expires = new Date()
    expires.setHours(expires.getHours() + 24)
    localStorage.setItem('homeVisited', expires.getTime().toString())
    onClose()
  }
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center '>
      <div className='fixed inset-0 bg-primary-black opacity-70'></div>
      <div
        className={`fixed z-10 space-y-10 rounded-[33px] rounded-xl  border-opacity-10 bg-modal-black ${OPEN_ANOTHER_SHADOW} p-8 text-center `}
      >
        <div>
          <span className='text-xl font-bold'>퍼스널 뮤직 진단 받기</span>
          <span className='flex justify-center py-4'>
            <Image
              src={Businessman}
              alt='모달이미지'
              width={270}
              height={270}
            />
          </span>
          <div className='text-center font-bold text-white text-opacity-50'>
            <p>나의 음악 취향은 무엇일까?</p>
            <p> 재미있는 타이틀과 함께 음악을 추천 받아보세요!</p>
          </div>
        </div>
        <div className='flex flex-row justify-center gap-4 pb-4 pt-8'>
          <div>
            <PreviousButton onClick={onCloseModalHandler}>
              오늘은 그만보기
            </PreviousButton>
          </div>
          <div>
            <ButtonPrimary onClick={onPersonalTestHandler}>
              <div className='flex flex-row gap-4'>
                <p>진단 받기</p>
                <Image src={submitIcon} alt='화살표' width={8} height={14} />
              </div>
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalModalDetail
