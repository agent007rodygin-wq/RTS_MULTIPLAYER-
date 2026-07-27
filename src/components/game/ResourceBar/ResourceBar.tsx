import React from 'react';
import styles from './ResourceBar.module.css';

interface ResourceBarProps {
  coinImageUrl: string;
  populationImageUrl: string;
  rubyImageUrl: string;
  coins: number;
  maxCoins: number;
  workers: number;
  maxWorkers: number;
  rubies: number;
  onBuyRubies: () => void;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
  coinImageUrl,
  populationImageUrl,
  rubyImageUrl,
  coins,
  maxCoins,
  workers,
  maxWorkers,
  rubies,
  onBuyRubies,
}) => {
  return (
    <div className={styles.bar}>

      {/* Gold */}
      <div className={styles.group}>
        <img src={coinImageUrl} alt="" className={styles.icon} />
        <span className={`${styles.text} ${styles.textGold}`}>
          {coins.toLocaleString()} / {maxCoins.toLocaleString()}
        </span>
      </div>

      <span className={styles.separator} aria-hidden="true" />

      {/* Population */}
      <div className={styles.group}>
        <img src={populationImageUrl} alt="" className={styles.icon} />
        <span className={`${styles.text} ${styles.textPop}`}>
          {workers} / {maxWorkers}
        </span>
      </div>

      <span className={styles.separator} aria-hidden="true" />

      {/* Rubies */}
      <div className={styles.rubyGroup}>
        <img src={rubyImageUrl} alt="" aria-hidden="true" className={styles.iconRuby} />
        <button
          type="button"
          onClick={onBuyRubies}
          className={styles.rubyBtn}
          aria-label={`Рубины: ${rubies.toLocaleString()}. Открыть магазин рубинов`}
        >
          <span className={`${styles.text} ${styles.textRuby}`}>
            {rubies.toLocaleString()}
          </span>
        </button>

        <div className={styles.tooltip}>
          <div className={styles.tooltipInner}>
            <p className={styles.tooltipText}>
              {'Покачто рубины можно купить через личку в телеграмме вот мой линк\n@BTCtokenbanker напиши мне по поводу покупки рубинов'}
            </p>
            <div className={styles.tooltipActions}>
              <button type="button" onClick={onBuyRubies} className={styles.tooltipBtnBuy}>
                Купить Рубины!
              </button>
              <button type="button" disabled className={styles.tooltipBtnAd}>
                Посмотри рекламу и получи рубин
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResourceBar;
