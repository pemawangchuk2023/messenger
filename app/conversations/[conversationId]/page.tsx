import getConversationById from '@/app/actions/getConversationById';
import getMessages from '@/app/actions/getMessages';
import EmptyState from '@/components/EmptyState';
import Header from './components/Header';
import Form from './components/FormComponent';
import Body from './components/Body';
import getCurrentUser from '@/app/actions/getCurrentUser';

interface IParams {
  conversationId: string;
}
const ConversationId = async ({ params }: { params: Promise<IParams> }) => {
  const currentUser = await getCurrentUser();
  const resolvedParams = await params;
  const conversationId = resolvedParams.conversationId;

  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);

  if (!conversation) {
    return (
      <div className='lg:pl-80 h-full'>
        <div className='h-full flex flex-col'>
          <EmptyState />
        </div>
      </div>
    );
  }
  return (
    <div className='lg:pl-80 h-full'>
      <div className='h-full flex flex-col'>
        <Header conversation={conversation} />
        <Body Initialmessages={messages} />
        <Form />
      </div>
    </div>
  );
};

export default ConversationId;
