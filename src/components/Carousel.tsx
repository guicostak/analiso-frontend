import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import styled from 'styled-components';
import { Theme } from '../common/styles/Theme';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

export interface Photo {
  id: string;
  url: string;
  alt: string;
  title?: string;
  icon?: string;
}

interface CarouselProps {
  photos: Array<Photo>;
}

const StyledSwiperContainer = styled(Swiper)`
  width: 90%;
  height: 500px;
  position: relative;
  margin-top: 2rem;

  .customized-icon {
    height: 1rem;
    width: 1rem;
    margin-right: 0.5rem;
  }

  /* Estilos para os slides do Swiper */
  .swiper-slide {
    text-align: center;
    font-size: 18px;
    display: flex;
    justify-content: flex-end; /* Alinha os slides à direita */
    align-items: center;
    height: 100%;
  }

  /* Estilos para os botões de navegação */
  .swiper-button-prev,
  .swiper-button-next {
    position: absolute;
    top: 50%;
    width: 30px;
    height: 30px;
    color: ${Theme.primaryColor};
    transform: translateY(-50%);
    cursor: pointer;
  }

  /* Estilos para a paginação */
  .swiper-pagination {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .swiper-pagination-bullet {
    width: auto;
    max-width: 18rem;
    height: auto;
    background-color: ${Theme.primaryColor};
    border-radius: 10px;
    cursor: pointer;
    z-index: 1000;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
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
          return `<span class="${className}"><img class="customized-icon" src="${photos[index].icon}" alt="${title}" />${title}</span>`;
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
