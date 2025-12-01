import { useAppSelector } from '@store/hooks';
import { selectIsLoading } from '@store/slices/loadingSlice';
import './GlobalLoader.scss';

const GlobalLoader: React.FC = () => {
  const isLoading = useAppSelector(selectIsLoading);

  if (!isLoading) return null;

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-content">
        <div className="global-loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="global-loader-text">Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;

