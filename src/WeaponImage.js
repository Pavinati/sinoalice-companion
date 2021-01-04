const weaponImageId = (id) => {
  switch (id) {
    case 989:
      return 575;

    case 990:
      return 576;

    default:
      return id;
  }
};

const weaponImageUrl = (weapon) => {
  const stringId = weaponImageId(weapon.id).toString().padStart(4, '0');
  return `https://sinoalice.game-db.tw/images/card/CardS${stringId}.png`
};


const WeaponImage = ({ weapon, onClick }) => (
  <img
    className="weapon-icon"
    src={weaponImageUrl(weapon)}
    alt={weapon.name}
    onClick={onClick}
  />
);

export default WeaponImage;
