import { LandRequestStatus, LandRequest, PullRequest } from '../db';

export class LandRequestQueue {
  public getStatusesForWaitingRequests = async () => {
    return LandRequestStatus.findAll<LandRequestStatus>({
      where: {
        isLatest: true,
        state: 'will-queue-when-ready',
      },
      order: [['date', 'ASC']],
      include: [
        {
          model: LandRequest,
          include: [PullRequest],
        },
      ],
    });
  };

  // returns the list of queued, running, awaiting-merge, and merging items as these are the actual "queue" per se
  // all the status' we display on the frontend
  public getQueue = async () => {
    const queue = await LandRequestStatus.findAll<LandRequestStatus>({
      where: {
        isLatest: true,
        state: {
          $in: ['queued', 'running', 'awaiting-merge', 'merging'],
        },
      },
      order: [
        [LandRequestStatus.associations?.request, 'priority', 'DESC'],
        ['date', 'ASC'],
      ],
      include: [
        {
          model: LandRequest,
          include: [PullRequest],
        },
      ],
    });
    return queue;
  };

  // returns builds that are running, awaiting-merge, or merging, used to find the dependencies of a request
  // that is about to move to running state
  public getRunning = async () => {
    return LandRequestStatus.findAll<LandRequestStatus>({
      where: {
        isLatest: true,
        state: {
          $in: ['running', 'awaiting-merge', 'merging'],
        },
      },
      order: [['date', 'ASC']],
      include: [
        {
          model: LandRequest,
          include: [PullRequest],
        },
      ],
    });
  };

  public maybeGetStatusForNextRequestInQueue = async () => {
    const requestStatus = await LandRequestStatus.findOne<LandRequestStatus>({
      where: {
        isLatest: true,
        state: 'queued',
      },
      order: [['date', 'ASC']],
      include: [
        {
          model: LandRequest,
          include: [PullRequest],
        },
      ],
    });
    if (!requestStatus) return null;

    return requestStatus;
  };

  public maybeGetStatusForQueuedRequestById = async (requestId: string) => {
    const requestStatus = await LandRequestStatus.findOne<LandRequestStatus>({
      where: {
        requestId,
        isLatest: true,
        state: 'queued',
      },
      include: [
        {
          model: LandRequest,
        },
      ],
    });
    if (!requestStatus || !requestStatus.request) return null;

    return requestStatus;
  };
}
