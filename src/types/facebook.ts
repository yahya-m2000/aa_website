export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  attachments?: {
    data: Array<{
      type: string;
      media?: {
        image?: {
          src: string;
        };
      };
      subattachments?: {
        data: Array<{
          media?: {
            image?: {
              src: string;
            };
          };
        }>;
      };
    }>;
  };
}

export interface FacebookFeedResponse {
  data: FacebookPost[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}
