'use client'

import { useSession } from 'next-auth/react'

const Footer = () => {
  const session = useSession()

  const check = session.status === 'authenticated'

  return (
    <footer className={`${!check ? 'pl-20' : 'pl-28'} border-t border-black`}>
      <nav className='footer h-[196px] py-8 '>
        <section>
          <h1 className='py-2 text-[28px] font-bold italic text-primary-white'>
            V-UP
          </h1>
        </section>
        <section className='flex flex-row py-2'>
          <section className=''>
            <section className='flex flex-row gap-8 py-2'>
              <section className='w-30 text-xs'>front-end Developer</section>
              <ul className='grid list-none grid-cols-5 gap-3 text-xs'>
                <li>성예지</li>
                <li>강지수</li>
                <li>남해리</li>
                <li>서가희</li>
              </ul>
            </section>
            <section className='flex flex-row gap-8 '>
              <p className='w-[107px] text-xs'>UXUI Designer</p>
              <p className=' text-xs'>전주용</p>
            </section>
          </section>
          <section className='flex justify-end '>
            <p
              className={`${!check ? 'pl-32' : 'pl-20'} justify-end py-2 text-xs font-bold text-primary`}
            >
              © 2024 VakVakVerse. All rights reserved.
            </p>
          </section>
        </section>
      </nav>
    </footer>
  )
}

export default Footer
