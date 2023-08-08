import {Ticket} from '../ticket';

it('implements optimistic concurrency control', async () => {
    //create instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123',
    });
    //save ticket to db
    await ticket.save();
    //fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    //make two separate changes to the ticket
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});
    //save first fetched ticket
    await firstInstance!.save();
    //save second fetched ticket and expect an error
    expect(secondInstance!.save()).rejects.toThrow();
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: '123',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});
