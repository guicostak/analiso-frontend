import carouselItems from '../common/mock-bff/carouselMock';

function useCarousel() {
  const getCarouselItems = () => carouselItems;

  return {
    getCarouselItems,
  };
}

export default useCarousel;
