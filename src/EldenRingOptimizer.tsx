```tsx
import React, { useMemo, useState } from 'react';

export interface StatItem {
  name: string;
  amount: number;
}

export interface Armor {
  id: string;
  name: string;
  category: string;
  image?: string;
  description?: string;
  dmgNegation?: StatItem[];
  resistance?: StatItem[];
  weight: number;
}

export interface Weapon {
  id: string;
  name: string;
  category: string;
  weight: number;
  attack?: StatItem[];
  scaling?: { name: string; amount: string }[];
  requirements?: StatItem[];
}

interface OptimizerProps {
  armorData: Armor[];
  weaponData: Weapon[];
}

interface UserStats {
  str: number;
  dex: number;
  int: number;
  fai: number;
  arc: number;
  end: number;
}

export const EldenRingOptimizer: React.FC<OptimizerProps> = ({
  armorData,
  weaponData,
}) => {
  const [stats, setStats] = useState<UserStats>({
    str: 10,
    dex: 10,
    int: 10,
    fai: 10,
    arc: 10,
    end: 10,
  });

  const [isTwoHanding, setIsTwoHanding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const maxEquipLoad = useMemo(() => {
    const { end } = stats;

    if (end <= 8) return 45.0;
    if (end <= 25) return 45.0 + (end - 8) * 1.6111;
    if (end <= 60) return 72.4 + (end - 25) * 1.36;

    return 120.0 + (end - 60) * 1.025;
  }, [stats.end]);

  const getScalingMultiplier = (tier: string): number => {
    switch (String(tier ?? '').toUpperCase()) {
      case 'S':
        return 1.4;
      case 'A':
        return 1.0;
      case 'B':
        return 0.75;
      case 'C':
        return 0.5;
      case 'D':
        return 0.25;
      case 'E':
        return 0.1;
      default:
        return 0;
    }
  };

  const calculateAR = (
    weapon: Weapon,
    currentStats: UserStats,
    twoHanding: boolean
  ): number => {
    const baseAttack = (weapon.attack ?? []).reduce(
      (acc, curr) => acc + (Number(curr?.amount) || 0),
      0
    );

    const bonusAR = (weapon.scaling ?? []).reduce((acc, scaling) => {
      const statName = String(scaling?.name ?? '').toLowerCase();
      let statValue = 0;

      if (statName.includes('str')) {
        statValue = twoHanding
          ? Math.floor(currentStats.str * 1.5)
          : currentStats.str;
      } else if (statName.includes('dex')) {
        statValue = currentStats.dex;
      } else if (statName.includes('int')) {
        statValue = currentStats.int;
      } else if (statName.includes('fai')) {
        statValue = currentStats.fai;
      } else if (statName.includes('arc')) {
        statValue = currentStats.arc;
      }

      return (
        acc +
        baseAttack *
          getScalingMultiplier(String(scaling?.amount ?? '')) *
          (statValue / 100)
      );
    }, 0);

    return Math.floor(baseAttack + bonusAR);
  };

  const eligibleWeapons = useMemo(() => {
    const effectiveStr = isTwoHanding
      ? Math.floor(stats.str * 1.5)
      : stats.str;

    let filtered = (weaponData ?? []).filter((weapon) => {
      const requirements = weapon.requirements ?? [];

      return requirements.every((req) => {
        const reqName = String(req?.name ?? '').toLowerCase();
        const reqAmount = Number(req?.amount) || 0;

        if (reqName.includes('str')) {
          return effectiveStr >= reqAmount;
        }

        if (reqName.includes('dex')) {
          return stats.dex >= reqAmount;
        }

        if (reqName.includes('int')) {
          return stats.int >= reqAmount;
        }

        if (reqName.includes('fai')) {
          return stats.fai >= reqAmount;
        }

        if (reqName.includes('arc')) {
          return stats.arc >= reqAmount;
        }

        return true;
      });
    });

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (weapon) => weapon.category === selectedCategory
      );
    }

    return filtered
      .map((weapon) => ({
        ...weapon,
        calculatedAR: calculateAR(weapon, stats, isTwoHanding),
      }))
      .sort((a, b) => b.calculatedAR - a.calculatedAR);
  }, [weaponData, stats, isTwoHanding, selectedCategory]);

  const categories = useMemo(() => {
    const weaponCategories = (weaponData ?? [])
      .map((weapon) => weapon.category)
      .filter(Boolean);

    return ['All', ...Array.from(new Set(weaponCategories))];
  }, [weaponData]);

  const optimizedArmor = useMemo(() => {
    if (!selectedWeapon) {
      return null;
    }

    const medRollAllowance =
      maxEquipLoad * 0.7 - (selectedWeapon.weight || 0);

    const getStat = (
      armor: Armor,
      arrayName: 'dmgNegation' | 'resistance',
      statName: string
    ): number => {
      const statsArray = armor[arrayName] ?? [];

      return (
        statsArray.find((item) => item?.name === statName)?.amount ?? 0
      );
    };

    const efficiencyScore = (armor: Armor): number => {
      const poise = getStat(armor, 'resistance', 'Poise');
      const physical = getStat(armor, 'dmgNegation', 'Phy');

      return (poise * 2 + physical) / (armor.weight || 1);
    };

    const getTop15 = (category: string): Armor[] => {
      return (armorData ?? [])
        .filter((armor) => armor.category === category)
        .sort(
          (a, b) => efficiencyScore(b) - efficiencyScore(a)
        )
        .slice(0, 15);
    };

    const helms = getTop15('Helm');
    const chests = getTop15('Chest Armor');
    const gauntlets = getTop15('Gauntlets');
    const legs = getTop15('Leg Armor');

    let bestCombo: Armor[] = [];
    let maxScore = -1;
    let bestWeight = 0;

    for (const helm of helms) {
      for (const chest of chests) {
        for (const gauntlet of gauntlets) {
          for (const leg of legs) {
            const weight =
              (helm.weight || 0) +
              (chest.weight || 0) +
              (gauntlet.weight || 0) +
              (leg.weight || 0);

            if (weight <= medRollAllowance) {
              const score = [helm, chest, gauntlet, leg].reduce(
                (total, piece) =>
                  total +
                  getStat(piece, 'resistance', 'Poise') +
                  getStat(piece, 'dmgNegation', 'Phy'),
                0
              );

              if (score > maxScore) {
                maxScore = score;
                bestCombo = [helm, chest, gauntlet, leg];
                bestWeight = weight;
              }
            }
          }
        }
      }
    }

    if (bestCombo.length === 0) {
      return null;
    }

    return {
      combo: bestCombo,
      weight: bestWeight,
      score: maxScore,
    };
  }, [armorData, selectedWeapon, maxEquipLoad]);

  const currentEquipLoad =
    (selectedWeapon?.weight || 0) +
    (optimizedArmor?.weight || 0);

  const loadPercentage =
    maxEquipLoad > 0
      ? (currentEquipLoad / maxEquipLoad) * 100
      : 0;

  const loadStatus =
    loadPercentage <= 30
      ? 'Light'
      : loadPercentage <= 70
      ? 'Medium'
      : 'Heavy';

  const remainingMedWeight =
    maxEquipLoad * 0.7 - currentEquipLoad;

  const handleStatChange = (
    stat: keyof UserStats,
    value: string
  ) => {
    setStats((prev) => ({
      ...prev,
      [stat]: Math.max(1, parseInt(value, 10) || 1),
    }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-4">
        Elden Ring Build Optimizer (V1)
      </h2>

      <div className="grid grid-cols-6 gap-2 mb-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="uppercase text-xs font-bold mb-1">
              {key}
            </label>

            <input
              type="number"
              className="border p-2 rounded"
              value={value}
              onChange={(event) =>
                handleStatChange(
                  key as keyof UserStats,
                  event.target.value
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 bg-gray-100 p-4 rounded">
        <div>
          <label className="flex items-center space-x-2 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={isTwoHanding}
              onChange={(event) =>
                setIsTwoHanding(event.target.checked)
              }
              className="form-checkbox"
            />

            <span>Two-Handing Weapon (1.5x STR)</span>
          </label>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            Max Equip Load: {maxEquipLoad.toFixed(1)}
          </p>

          <p>
            Status:{' '}
            <span className="font-bold">
              {loadStatus} Roll
            </span>{' '}
            ({currentEquipLoad.toFixed(1)} /{' '}
            {maxEquipLoad.toFixed(1)})
          </p>

          <p className="text-sm text-gray-600">
            Remaining Med Roll Allowance:{' '}
            {remainingMedWeight > 0
              ? remainingMedWeight.toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">
              Usable Weapons
            </h3>

            <select
              className="border p-1 rounded"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="h-96 overflow-y-auto border rounded p-2">
            {eligibleWeapons.length === 0 && (
              <p className="text-gray-500">
                No weapons meet requirements.
              </p>
            )}

            {eligibleWeapons.map((weapon) => (
  <div
    key={weapon.id}
    className={
      selectedWeapon?.id === weapon.id
        ? 'p-2 border-b cursor-pointer hover:bg-blue-50 bg-blue-100'
        : 'p-2 border-b cursor-pointer hover:bg-blue-50'
    }
    onClick={() => setSelectedWeapon(weapon)}
  >
    <div className="flex justify-between font-semibold">
      <span>{weapon.name}</span>
      <span>{weapon.calculatedAR} AR</span>
    </div>

    <div className="text-xs text-gray-600 flex justify-between">
      <span>{weapon.category}</span>
      <span>Wt: {weapon.weight}</span>
    </div>
  </div>
))}
                onClick={() => setSelectedWeapon(weapon)}
              >
                <div className="flex justify-between font-semibold">
                  <span>{weapon.name}</span>
                  <span>{weapon.calculatedAR} AR</span>
                </div>

                <div className="text-xs text-gray-600 flex justify-between">
                  <span>{weapon.category}</span>
                  <span>Wt: {weapon.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">
            Optimized Armor
          </h3>

          <div className="border rounded p-4 h-96 bg-gray-50">
            {!selectedWeapon ? (
              <p className="text-gray-500">
                Select a weapon to optimize armor for Med Roll.
              </p>
            ) : optimizedArmor ? (
              <div className="space-y-4">
                {optimizedArmor.combo.map((armor) => (
                  <div
                    key={armor.id}
                    className="flex justify-between items-center p-2 bg-white border rounded"
                  >
                    <div>
                      <p className="font-bold">
                        {armor.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {armor.category}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      {armor.weight} Wt
                    </p>
                  </div>
                ))}

                <div className="pt-4 border-t mt-4">
                  <p className="flex justify-between">
                    <strong>Total Armor Weight:</strong>{' '}
                    {optimizedArmor.weight.toFixed(1)}
                  </p>

                  <p className="flex justify-between">
                    <strong>Optimization Score:</strong>{' '}
                    {optimizedArmor.score.toFixed(1)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-500">
                No combination found that allows Medium Roll with this weapon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```
