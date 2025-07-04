import { faker } from '@faker-js/faker';
import { type Alarm, alarmConfig } from '@/config/alarm-config';

let alarmIdCounter = 1;

const newAlarm = (): Alarm => {
  const alarm: Partial<Alarm> = {
    AlarmID: `ALM-${alarmIdCounter++}`,
  };

  for (const key in alarmConfig.fields) {
    if (key === 'AlarmID') continue;

    const config = alarmConfig.fields[key as keyof typeof alarmConfig.fields];
    let value: any;

    if (config.columnType === 'dateTime') {
      value = faker.date.recent({ days: 30 });
    } else if (config.columnType === 'categorical' && config.options) {
      value = faker.helpers.arrayElement(config.options.map(o => o.value));
    } else if (key === 'FlapCount') {
        value = faker.number.int({ min: 0, max: 50 });
    } else if (key === 'NELabel' || key === 'ObjectLabel' || key === 'AlarmName') {
      value = `${faker.word.adjective()} ${faker.word.noun()}`;
    } else if (key === 'AcknowledgedBy') {
        value = faker.person.fullName();
    } else if (key === 'InventoryAttached' || key === 'IsSuppressed' || key === 'ActivePull') {
        value = faker.datatype.boolean() ? 'Yes' : 'No';
    } else if (key === 'AlarmIdentifier') {
        value = faker.string.uuid();
    }
     else {
      value = faker.lorem.words(2);
    }
    (alarm as any)[key] = value;
  }
  
  return alarm as Alarm;
};

export function makeData(count: number): Alarm[] {
    if (count > 1) { // Reset for full data load
        alarmIdCounter = 1;
    }
    return Array.from({ length: count }, newAlarm);
}
