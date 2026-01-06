import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { getPersonById, updatePerson } from '@/services/mockData';
import { uploadFile, deleteFile } from '@/services/driveService';
import { analyzeImage, type ImageAnalysisResult } from '@/services/geminiService';
import { AnalysisModal } from '../components/AnalysisModal';
import type { Person, Media } from '@/types/person';
import { ProfileTabs } from '../components/ProfileTabs';
import { Timeline } from '../components/Timeline';
import { BasicInfo } from '../components/BasicInfo';
import { Gallery } from '../components/Gallery';
import { EditPersonModal } from '../components/EditPersonModal';

export const ProfileLayout = () => {
    const { id } = useParams<{ id: string }>();
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'gallery'>('info');
    const [isEditing, setIsEditing] = useState(false);


    // Analysis State
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);

    useEffect(() => {
        const fetchPerson = async () => {
            if (id) {
                const data = await getPersonById(id);
                setPerson(data || null);
            }
            setLoading(false);
        };
        fetchPerson();
    }, [id]);

    const handleSavePerson = async (updatedPerson: Person) => {
        setPerson(updatedPerson);
        await updatePerson(updatedPerson);
    };

    const handleSetProfilePhoto = async (url: string) => {
        if (!person) return;
        const updatedPerson = { ...person, profilePhotoUrl: url };
        setPerson(updatedPerson);
        await updatePerson(updatedPerson);
    };

    const handleSetCoverPhoto = async (url: string) => {
        if (!person) return;
        const updatedPerson = { ...person, coverPhotoUrl: url };
        setPerson(updatedPerson);
        await updatePerson(updatedPerson);
    };

    const handleUploadFile = async (file: File): Promise<Media | undefined> => {
        if (!person || !person.driveFolderId) return;

        // 1. Upload to Drive
        const driveFile = await uploadFile(file, person.driveFolderId);

        // 2. Add to Person's media list
        const newMedia = {
            id: driveFile.id,
            type: 'IMAGE' as const,
            url: driveFile.thumbnailLink || '',
            thumbnailUrl: driveFile.thumbnailLink || '',
            title: driveFile.name,
        };

        const updatedPerson = {
            ...person,
            media: [...person.media, newMedia],
        };

        // 3. Update State & Storage
        setPerson(updatedPerson);
        await updatePerson(updatedPerson);

        return newMedia;
    };

    // ... (rest of code)





    const handleDeleteImage = async (media: Media) => {
        if (!person || !confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;

        try {
            // 1. Delete from Drive
            await deleteFile(media.id);

            // 2. Remove from Person state
            const updatedMedia = person.media.filter((m) => m.id !== media.id);
            const updatedPerson = { ...person, media: updatedMedia };

            setPerson(updatedPerson);
            await updatePerson(updatedPerson);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error al eliminar la imagen');
        }
    };

    const handleUpdateMedia = async (updatedMediaItem: Media) => {
        if (!person) return;

        const updatedMediaList = person.media.map((m) =>
            m.id === updatedMediaItem.id ? updatedMediaItem : m
        );

        const updatedPerson = { ...person, media: updatedMediaList };
        setPerson(updatedPerson);
        await updatePerson(updatedPerson);
    };

    const handleUpdateEvent = async (updatedEvent: Event) => {
        if (!person) return;

        let updatedPerson = { ...person };

        if (updatedEvent.type === 'BIRTH') {
            updatedPerson.birth = updatedEvent;
        } else if (updatedEvent.type === 'DEATH') {
            updatedPerson.death = updatedEvent;
        }
        // TODO: Handle other events when they exist in the person object (e.g. in an events array)

        setPerson(updatedPerson);
        await updatePerson(updatedPerson);
    };

    const handleAnalyzeImage = async (media: Media) => {
        setAnalyzingImage(media.url);
        setIsAnalysisOpen(true);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await analyzeImage(media.id);
            setAnalysisResult(result);
        } catch (error: any) {
            console.error('Error analyzing image:', error);
            alert(`Error: ${error.message}`);
            setIsAnalysisOpen(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
    if (!person) return <div className="p-8 text-center">Persona no encontrada</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Header with Cover Photo */}
            <div className="relative h-48 md:h-64 bg-gray-300 overflow-hidden">
                {person.coverPhotoUrl && (
                    <img
                        src={person.coverPhotoUrl}
                        alt="Cover"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Back Button */}
                <Link to="/tree" className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </div>

            {/* Profile Info Header */}
            <div className="relative px-4 sm:px-6 lg:px-8 -mt-16 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-end">
                    {/* Profile Photo */}
                    <div className="relative">
                        <img
                            src={person.profilePhotoUrl || 'https://via.placeholder.com/150'}
                            alt={`${person.firstName} ${person.lastName}`}
                            referrerPolicy="no-referrer"
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-md hover:bg-indigo-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Name and Dates */}
                    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {person.firstName} {person.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {person.birth?.date?.display || '?'} - {person.isLiving ? 'Presente' : (person.death?.date?.display || '?')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'info' && <BasicInfo person={person} />}

                {activeTab === 'timeline' && (
                    <Timeline
                        events={[...(person.birth ? [person.birth] : []), ...(person.death ? [person.death] : [])]}
                        media={person.media}
                        onUpdateEvent={handleUpdateEvent}
                        onUpload={handleUploadFile}
                    />
                )}

                {activeTab === 'gallery' && (
                    <Gallery
                        media={person.media}
                        onSetProfilePhoto={handleSetProfilePhoto}
                        onSetCoverPhoto={handleSetCoverPhoto}
                        driveFolderId={person.driveFolderId}
                        onUpload={handleUploadFile}
                        onAnalyze={handleAnalyzeImage}
                        onDelete={handleDeleteImage}
                        onUpdateMedia={handleUpdateMedia}
                    />
                )}
            </div>

            {/* Edit Modal */}
            <EditPersonModal
                person={person}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSavePerson}
            />

            {/* Analysis Modal */}
            <AnalysisModal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                imageUrl={analyzingImage}
                isAnalyzing={isAnalyzing}
                result={analysisResult}
            />
        </div>
    );
};
