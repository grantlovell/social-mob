import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import socialsThisWeek from '../../../tests/fixtures/WeekSocials.json';
import {SocialMobApi} from './SocialMobApi';
import {ISocialMob, IUpdateSocialMobRequest} from '../types';
import {DateTimeApi} from './DateTimeApi';

const dummyMob: ISocialMob = {
    id: 1,
    attendees: [],
    topic: 'Start Topic',
    owner: {avatar: '', name: 'foobar', email: 'any@thing.com', id: 1},
    location: 'Slack #social-mobbing',
    start_time: '2020-05-31 20:30:20'
};

describe('SocialMobApi', () => {
    let mockBackend: MockAdapter;

    beforeEach(() => {
        mockBackend = new MockAdapter(axios);
    });

    afterEach(() => {
        mockBackend.restore();
    });

    it('returns the mobs of the current week if no date is provided', async () => {
        DateTimeApi.setTestNow('2020-05-01');
        mockBackend.onGet('social_mob/week?date=2020-05-01').reply(200, socialsThisWeek);

        const result = await SocialMobApi.getAllMobsOfTheWeek();

        expect(result).toEqual(socialsThisWeek);
    });


    it('returns the mobs of the week of the date provided', async() => {
        DateTimeApi.setTestNow('2020-05-01');
        mockBackend.onGet('social_mob/week?date=2020-01-01').reply(200, socialsThisWeek);

        const result = await SocialMobApi.getAllMobsOfTheWeek('2020-01-01');

        expect(result).toEqual(socialsThisWeek);
    });

    it('stores a new mob', async () => {
        const storeRequest = {
            topic: 'Any topic',
            location: 'Slack #social-mobbing',
            start_time: '2020-05-31 20:30:20'
        };
        mockBackend.onPost('social_mob').reply(201, {
            id: 1,
            ...storeRequest
        });

        const result = await SocialMobApi.store(storeRequest);

        expect(result.topic).toEqual(storeRequest.topic);
    });

    it('updates an existing mob', async () => {
        let newTopic: string = 'A totally new topic';
        mockBackend.onPut(`social_mob/${dummyMob.id}`).reply(200, {
            ...dummyMob,
            topic: newTopic
        });

        const payload: IUpdateSocialMobRequest = {topic: newTopic};
        const result = await SocialMobApi.update(dummyMob, payload);

        expect(result.topic).toEqual(newTopic);
    });

    it('deletes an existing mob', async () => {
        mockBackend.onDelete(`social_mob/${dummyMob.id}`).reply(200);

        const result = await SocialMobApi.delete(dummyMob);

        expect(result).toBe(true);
    });

    it('joins an existing mob', async () => {
        mockBackend.onPost(`social_mob/${dummyMob.id}/join`).reply(200);

        const result = await SocialMobApi.join(dummyMob);

        expect(result).toBe(true);
    });

    it('leaves an existing mob', async () => {
        mockBackend.onPost(`social_mob/${dummyMob.id}/leave`).reply(200);

        const result = await SocialMobApi.leave(dummyMob);

        expect(result).toBe(true);
    });
});
