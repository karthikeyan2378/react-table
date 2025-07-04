import { faker } from '@faker-js/faker';

export type Person = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: 'relationship' | 'complicated' | 'single';
  progress: number;
  createdAt: Date;
};

let idCounter = 1;

const newPerson = (): Person => {
  return {
    id: idCounter++,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 65 }),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    status: faker.helpers.shuffle<Person['status']>([
      'relationship',
      'complicated',
      'single',
    ])[0]!,
    createdAt: faker.date.past({ years: 2 }),
  };
};

export function makeData(count: number): Person[] {
    // Reset counter for subsequent calls if we're generating a fresh list
    if (count > 100) {
        idCounter = 1;
    }
    return Array.from({ length: count }, newPerson);
}
