interface MeetupData {
  id?: string;
  meetupName: string;
  meetupDesc: string;
  minimumAge: number;
  maximumAge: number;
  isPublic: boolean;
  allowUnverifiedUsers: boolean;
  invited: number[];
  date: string;
  fromTime: string;
  toTime: string;
  eventType: string;
  location: any;
  point?: any;
}

export default MeetupData;

