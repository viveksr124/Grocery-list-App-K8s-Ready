document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.getElementById( 'grocery-form' );
    const input = document.getElementById( 'grocery-input' );
    const list = document.getElementById( 'grocery-list' );

    // Fetch all items on load
    const fetchItems = async () => {
        try {
            showLoading( true );
            const response = await fetch( '/api/items' );

            if ( !response.ok ) {
                throw new Error( `HTTP error! status: ${ response.status }` );
            }

            const contentType = response.headers.get( 'content-type' );
            if ( !contentType || !contentType.includes( 'application/json' ) ) {
                throw new Error( "Received non-JSON response" );
            }

            const items = await response.json();
            renderItems( items );
        } catch ( error ) {
            console.error( 'Failed to fetch items:', error );
            showError( "Failed to load items. Please try again." );
        } finally {
            showLoading( false );
        }
    };

    // Add new item
    form.addEventListener( 'submit', async ( e ) => {
        e.preventDefault();
        const item = input.value.trim();
        if ( !item ) return;

        try {
            showLoading( true );
            const response = await fetch( '/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( { name: item } )
            } );

            if ( !response.ok ) {
                throw new Error( `HTTP error! status: ${ response.status }` );
            }

            input.value = '';
            await fetchItems(); // Refresh list
        } catch ( error ) {
            console.error( 'Failed to add item:', error );
            showError( "Failed to add item. Please try again." );
        } finally {
            showLoading( false );
        }
    } );

    // Delete item
    list.addEventListener( 'click', async ( e ) => {
        if ( e.target.classList.contains( 'delete-btn' ) ) {
            const id = e.target.dataset.id;
            try {
                showLoading( true );
                const response = await fetch( `/api/items/${ id }`, {
                    method: 'DELETE'
                } );

                if ( !response.ok ) {
                    throw new Error( `HTTP error! status: ${ response.status }` );
                }

                await fetchItems(); // Refresh list
            } catch ( error ) {
                console.error( 'Failed to delete item:', error );
                showError( "Failed to delete item. Please try again." );
            } finally {
                showLoading( false );
            }
        }
    } );

    // Render items to DOM
    const renderItems = ( items ) => {
        list.innerHTML = '';
        items.forEach( item => {
            const li = document.createElement( 'li' );
            li.innerHTML = `
                <span>${ item.name }</span>
                <button class="delete-btn" data-id="${ item._id }">Delete</button>
            `;
            list.appendChild( li );
        } );
    };

    // UI Helpers
    const showLoading = ( isLoading ) => {
        const button = form.querySelector( 'button[type="submit"]' );
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Adding...' : 'Add';
    };

    const showError = ( message ) => {
        const errorDiv = document.createElement( 'div' );
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.prepend( errorDiv );
        setTimeout( () => errorDiv.remove(), 3000 );
    };

    // Initialize
    fetchItems();
} );