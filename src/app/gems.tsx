import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Card, Screen, Scroll, SectionTitle, StackHeader } from '@/components/Layout';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { GEM_PACKS, GEMS, PLANS } from '@/lib/economy';
import { today } from '@/lib/id';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

function notConnected() {
  Alert.alert('Purchases aren’t connected yet', 'In-app purchases need StoreKit (for example through RevenueCat) and an App Store Connect product setup.');
}

export default function Gems() {
  const c = useColors();
  const gems = useStore((s) => s.gems);
  const checkIn = useStore((s) => s.checkIn);
  const ads = useStore((s) => s.ads);
  const claimCheckIn = useStore((s) => s.claimCheckIn);
  const watchAd = useStore((s) => s.watchAd);
  const [adOpen, setAdOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const claimedToday = checkIn.lastDate === today();
  const day = claimedToday ? checkIn.streak : (checkIn.streak % 7) + 1;
  const adsLeft = GEMS.adsPerDay - (ads.date === today() ? ads.count : 0);

  useEffect(() => {
    if (!adOpen) return;
    const t = setInterval(() => setCountdown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [adOpen]);

  return (
    <Screen>
      <StackHeader title="Gems" />
      <Scroll>
        <View style={{ backgroundColor: c.deep, borderRadius: 28, padding: 22, gap: 6 }}>
          <Txt variant="caption" color={c.deepInk2}>
            Your balance
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="diamond-outline" size={32} color={c.accent} />
            <Txt variant="display" color={c.deepInk} accessibilityLabel={`${gems} gems`}>
              {gems.toLocaleString()}
            </Txt>
          </View>
          <Txt variant="label" color={c.deepInk2}>
            Each character reply uses {GEMS.perReply} gems. Free gems refill every day.
          </Txt>
        </View>

        <Card style={{ paddingVertical: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt weight="medium">Daily check-in</Txt>
            <Txt variant="caption" secondary>
              Day {day} of 7
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {Array.from({ length: 7 }, (_, i) => {
              const n = i + 1;
              const done = n < day || (n === day && claimedToday);
              const isToday = n === day && !claimedToday;
              return (
                <View key={n} style={{ alignItems: 'center', gap: 4 }} accessibilityLabel={`Day ${n}${done ? ', claimed' : ''}`}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.soft : isToday ? c.accent : c.fill }}>
                    {done ? <Icon name="checkmark" size={16} color={c.softInk} /> : <Txt variant="micro" color={isToday ? c.onAccent : c.ink2}>+{n === 7 ? GEMS.checkInDay7 : GEMS.checkIn}</Txt>}
                  </View>
                  <Txt variant="micro" secondary>
                    Day {n}
                  </Txt>
                </View>
              );
            })}
          </View>
          <Button
            label={claimedToday ? 'Claimed · come back tomorrow' : `Claim +${day === 7 ? GEMS.checkInDay7 : GEMS.checkIn} gems`}
            kind={claimedToday ? 'soft' : 'primary'}
            disabled={claimedToday}
            onPress={() => claimCheckIn()}
          />
        </Card>

        <Card style={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play-circle-outline" size={24} color={c.softInk} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt>Watch a short ad</Txt>
            <Txt variant="caption" secondary>
              +{GEMS.adReward} gems · {adsLeft} left today
            </Txt>
          </View>
          <Button label="Watch" kind="outline" small disabled={adsLeft <= 0} onPress={() => { setCountdown(5); setAdOpen(true); }} />
        </Card>

        <SectionTitle>Plans</SectionTitle>
        {PLANS.map((p, i) => (
          <Card key={p.id} style={{ paddingVertical: 16, gap: 10, borderWidth: i === 1 ? 2 : 0, borderColor: c.accent }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt variant="bodyLg" weight="medium">
                {p.name}
              </Txt>
              <Txt>{p.price}</Txt>
            </View>
            {p.perks.map((perk) => (
              <View key={perk} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Icon name="checkmark" size={16} color={c.link} />
                <Txt variant="label">{perk}</Txt>
              </View>
            ))}
            <Button label={`Choose ${p.name.replace('Kinship ', '')}`} kind={i === 1 ? 'primary' : 'outline'} small onPress={notConnected} />
          </Card>
        ))}

        <SectionTitle>Gem packs</SectionTitle>
        <Card>
          {GEM_PACKS.map((p, i) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.line2 }}>
              <Icon name="diamond-outline" size={22} color={c.link} />
              <View style={{ flex: 1 }}>
                <Txt>{p.gems.toLocaleString()} gems</Txt>
                {'tag' in p ? (
                  <Txt variant="micro" color={c.link}>
                    {p.tag}
                  </Txt>
                ) : null}
              </View>
              <Button label={p.price} kind="soft" small onPress={notConnected} accessibilityLabel={`Buy ${p.gems} gems for ${p.price}`} />
            </View>
          ))}
        </Card>
        <Txt variant="micro" secondary style={{ marginHorizontal: 4 }}>
          Prices in USD. Subscriptions renew automatically until cancelled in your Apple ID settings.
        </Txt>
      </Scroll>

      <Sheet visible={adOpen} onClose={() => setAdOpen(false)} title="Sponsored">
        <View style={{ height: 200, borderRadius: 24, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="megaphone-outline" size={36} color={c.ink2} />
          <Txt secondary center style={{ paddingHorizontal: 24 }}>
            Ad placeholder. Connect a rewarded-ads SDK (for example Google Mobile Ads) here.
          </Txt>
        </View>
        <Button
          label={countdown > 0 ? `Reward in ${countdown}s` : `Collect +${GEMS.adReward} gems`}
          disabled={countdown > 0}
          style={{ marginTop: 12 }}
          onPress={() => {
            watchAd();
            setAdOpen(false);
          }}
        />
      </Sheet>
    </Screen>
  );
}
