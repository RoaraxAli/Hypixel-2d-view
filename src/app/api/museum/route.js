import { NextResponse } from 'next/server';
import { getMuseumData } from '@/lib/hypixelApi';
import { parseNbtItems } from '@/lib/nbtParser';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = searchParams.get('profile');
    const uuid = searchParams.get('uuid');

    if (!profile) {
      return NextResponse.json(
        { error: 'Missing profile query parameter' },
        { status: 400 }
      );
    }

    const rawMuseum = await getMuseumData(profile);
    if (!rawMuseum || !rawMuseum.members) {
      return NextResponse.json({
        success: true,
        museum: null
      });
    }

    const memberKey = (uuid && rawMuseum.members[uuid]) ? uuid : Object.keys(rawMuseum.members)[0];
    const memberData = rawMuseum.members[memberKey];

    if (!memberData) {
      return NextResponse.json({
        success: true,
        museum: null
      });
    }

    const itemsEntries = Object.entries(memberData.items || {});
    const specialEntries = Array.isArray(memberData.special) ? memberData.special : [];

    const [weaponsArmor, specialItems] = await Promise.all([
      Promise.all(itemsEntries.map(async ([key, val]) => {
        let parsed = [];
        if (val?.items?.data) {
          parsed = await parseNbtItems(val.items.data);
        }
        return {
          id: key,
          donatedTime: val?.donated_time || 0,
          borrowing: val?.borrowing || false,
          item: parsed[0] || null
        };
      })),
      Promise.all(specialEntries.map(async (spec, idx) => {
        let parsed = [];
        if (spec?.items?.data) {
          parsed = await parseNbtItems(spec.items.data);
        }
        return {
          index: idx,
          donatedTime: spec?.donated_time || 0,
          item: parsed[0] || null
        };
      }))
    ]);

    return NextResponse.json({
      success: true,
      museum: {
        value: memberData.value || 0,
        appraisal: memberData.appraisal || false,
        totalItemsCount: weaponsArmor.length + specialItems.length,
        weaponsArmorCount: weaponsArmor.length,
        specialItemsCount: specialItems.length,
        weaponsArmor,
        specialItems
      }
    });
  } catch (err) {
    console.error('Error fetching museum data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
