import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import styled from 'styled-components';
import { Theme } from '../common/styles/Theme';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import media from '../common/styles/MediaScreens';

export interface Photo {
  id: string;
  url: string;
  alt: string;
  title?: string;
  icon?: string;
  description?: string;
}

interface CarouselProps {
  photos: Array<Photo>;
}

const StyledSwiperContainer = styled(Swiper)`
  width: 80%;
  height: 450px;
  position: relative;
  margin-top: 4rem;

  .customized-icon {
    height: 1rem;
    width: 1rem;
    margin-right: 1rem;
  }

  .swiper-slide {
    text-align: center;
    font-size: 18px;
    display: flex;
    justify-content: flex-end; /* Alinha os slides à direita */
    align-items: center;
    height: 100%;
  }

  .swiper-pagination {
    position: absolute;
    top: 33%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .swiper-pagination-bullet {
    width: 18rem;
    height: auto;
    background-color: ${Theme.secondaryColor};
    border-bottom: 1px solid ${Theme.primaryColor};
    color: white;
    border-radius: 0px;
    cursor: pointer;
    z-index: 1000;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: start;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
  }

  .bullet {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
  }

  .bullet-title {
    display: flex;
    flex-direction: row;  
    align-items: center;
  }


  .bullet > p {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    text-align: left;
  }

  ${media.mobile} {
    width: 100%;
    height: 500px;
    margin-top: 0rem;

    .swiper-pagination {
      position: absolute;
      top: 80%;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .swiper-pagination-bullet {
      width: 10px;
      height: 10px;
      background-color: ${Theme.primaryColor};
      border-radius: 100%;
      border: none;
      font-size: 0;
      padding: 0;
    }

    .bullet > p {
      font-size: 0rem;
      margin-top: 0.5rem;
    }

    .customized-icon {
      display: none;
    }
  }
`;

export const Carousel: React.FC<CarouselProps> = ({ photos }) => {
  return (
    <StyledSwiperContainer
      spaceBetween={50}
      slidesPerView={1}
      effect="fade"
      autoplay={{ delay: 5000 }} 
      pagination={{
        clickable: true,
        renderBullet: (index, className) => {
          const title = photos[index].title ?? '';
          return `<div class="${className} bullet"><div class="bullet-title"><img class="customized-icon" src="${photos[index].icon}" alt="${title}" />${title}</div><p>${photos[index].description}</p></div>`;
        },
      }}
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
    >
      {photos.map((photo) => (
        <SwiperSlide key={photo.id}>
          <img src={photo.url} alt={photo.alt} style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </SwiperSlide>
      ))}
    </StyledSwiperContainer>
  );
};
